import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { v4 as uuidv4 } from 'uuid';
import { Questions } from '../../entities/questions.entity';
import { TestPoint } from '../../entities/test-point.entity';
import { UserSubmissionCode } from '../../entities/user-submission-code.entity';
import { UserSubmissionRecord } from '../../entities/user-submission-record.entity';
import { AddTestQuestionDto, SubmitTestQuestionDto } from './dto/question.dto';
import { getLanguageId } from '../../config/judge0.config';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Questions) private readonly questionRepo: Repository<Questions>,
    @InjectRepository(TestPoint) private readonly testPointRepo: Repository<TestPoint>,
    @InjectRepository(UserSubmissionCode) private readonly submissionCodeRepo: Repository<UserSubmissionCode>,
    @InjectRepository(UserSubmissionRecord) private readonly submissionRecordRepo: Repository<UserSubmissionRecord>,
    @InjectQueue('judge') private readonly judgeQueue: Queue,
  ) {}

  async getByPage(pageNum: number, size: number, keyword: string) {
    const [list, total] = await this.questionRepo.findAndCount({
      where: keyword ? { title: Like(`%${keyword}%`) } : {},
      skip: (pageNum - 1) * size,
      take: size,
      order: { createTime: 'DESC' },
    });
    return { list, total, pageNum, size };
  }

  async getCount(keyword: string) {
    const count = await this.questionRepo.count({
      where: keyword ? { title: Like(`%${keyword}%`) } : {},
    });
    return { count };
  }

  async getById(id: string) {
    const q = await this.questionRepo.findOne({ where: { id } });
    if (!q) throw new NotFoundException('题目不存在');
    return q;
  }

  async getByName(name: string) {
    return this.questionRepo.find({ where: { title: Like(`%${name}%`) } });
  }

  async addTestQuestion(dto: AddTestQuestionDto) {
    const question = this.questionRepo.create({
      id: dto.id || uuidv4(),
      title: dto.title,
      label: dto.label,
      testPointNum: dto.testPointNum ?? 0,
      description: dto.description,
      limitedTime: dto.limitedTime,
    });
    await this.questionRepo.save(question);

    if (dto.testPointList?.length) {
      const points = dto.testPointList.map((p) =>
        this.testPointRepo.create({
          questionId: question.id,
          input: p.input,
          output: p.output,
          isSample: p.isSample ?? 0,
        }),
      );
      await this.testPointRepo.save(points);
    }
    return { message: '添加成功', id: question.id };
  }

  async updateTestQuestion(dto: AddTestQuestionDto) {
    if (!dto.id) throw new BadRequestException('缺少题目ID');
    const question = await this.questionRepo.findOne({ where: { id: dto.id } });
    if (!question) throw new NotFoundException('题目不存在');

    Object.assign(question, {
      title: dto.title ?? question.title,
      label: dto.label ?? question.label,
      testPointNum: dto.testPointNum ?? question.testPointNum,
      description: dto.description ?? question.description,
      limitedTime: dto.limitedTime ?? question.limitedTime,
    });
    await this.questionRepo.save(question);

    if (dto.testPointList?.length) {
      await this.testPointRepo.delete({ questionId: dto.id });
      const points = dto.testPointList.map((p) =>
        this.testPointRepo.create({
          questionId: dto.id,
          input: p.input,
          output: p.output,
          isSample: p.isSample ?? 0,
        }),
      );
      await this.testPointRepo.save(points);
    }
    return { message: '更新成功' };
  }

  async deleteById(id: string) {
    const question = await this.questionRepo.findOne({ where: { id } });
    if (!question) throw new NotFoundException('题目不存在');
    await this.testPointRepo.delete({ questionId: id });
    await this.questionRepo.delete({ id });
    return { message: '删除成功' };
  }

  async getTestPointsByQuestionId(id: string) {
    return this.testPointRepo.find({ where: { questionId: id } });
  }

  async submitTestQuestion(dto: SubmitTestQuestionDto) {
    const langId = getLanguageId(dto.language);
    if (!langId) throw new BadRequestException(`不支持的语言: ${dto.language}`);

    const question = await this.questionRepo.findOne({ where: { id: dto.id } });
    if (!question) throw new NotFoundException('题目不存在');

    const testPoints = await this.testPointRepo.find({ where: { questionId: dto.id } });

    const codeRecord = this.submissionCodeRepo.create({
      id: uuidv4(),
      userId: dto.userId,
      questionId: dto.id,
      code: dto.answer,
    });
    await this.submissionCodeRepo.save(codeRecord);

    const submissionId = uuidv4();
    const recordIds: string[] = testPoints.map(() => uuidv4());

    const records = testPoints.map((tp, i) =>
      this.submissionRecordRepo.create({
        id: recordIds[i],
        userId: dto.userId,
        questionId: dto.id,
        codeId: codeRecord.id,
        language: dto.language,
        result: 'Pending',
      }),
    );
    await this.submissionRecordRepo.save(records);

    await this.judgeQueue.add('judge', {
      submissionId,
      code: dto.answer,
      langId,
      testPoints,
      recordIds,
      limitedTime: question.limitedTime,
    });

    return { id: submissionId, questionResultList: recordIds.map((id) => ({ id, result: 'Pending' })) };
  }
}
