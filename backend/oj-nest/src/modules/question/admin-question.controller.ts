import { Body, Controller, Delete, Get, Post, Query, UseGuards } from '@nestjs/common';
import { QuestionService } from './question.service';
import { AddTestQuestionDto } from './dto/question.dto';
import { TokenGuard } from '../../common/guards/token.guard';

@UseGuards(TokenGuard)
@Controller('api/testQuestion')
export class AdminQuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get('getTestQuestionByPage')
  getByPage(
    @Query('pageNum') pageNum: number,
    @Query('size') size: number,
    @Query('keyword') keyword: string,
  ) {
    return this.questionService.getByPage(+pageNum || 1, +size || 10, keyword ?? '');
  }

  @Get('getTestQuestionCount')
  getCount(@Query('keyword') keyword: string) {
    return this.questionService.getCount(keyword ?? '');
  }

  @Get('getTestQuestionById')
  getById(@Query('id') id: string) {
    return this.questionService.getById(id);
  }

  @Get('getTestQuestionByName')
  getByName(@Query('name') name: string) {
    return this.questionService.getByName(name);
  }

  @Get('getTestPointsListByQuestionId')
  getTestPoints(@Query('id') id: string) {
    return this.questionService.getTestPointsByQuestionId(id);
  }

  @Post('addTestQuestion')
  addQuestion(@Body() dto: AddTestQuestionDto) {
    return this.questionService.addTestQuestion(dto);
  }

  @Post('updateTestQuestion')
  updateQuestion(@Body() dto: AddTestQuestionDto) {
    return this.questionService.updateTestQuestion(dto);
  }

  @Delete('deleteTestQuestionById')
  deleteQuestion(@Query('id') id: string) {
    return this.questionService.deleteById(id);
  }
}
