import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Comment } from '../../entities/comment.entity';
import { CommentLike } from '../../entities/comment-like.entity';
import { User } from '../../entities/user.entity';
import { CancelCommentLikeDto, CommentDto, CommentLikeDto } from './dto/comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment) private readonly commentRepo: Repository<Comment>,
    @InjectRepository(CommentLike) private readonly likeRepo: Repository<CommentLike>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async addComment(dto: CommentDto) {
    const comment = this.commentRepo.create({
      userId: dto.userId,
      content: dto.content,
      parentCommentId: dto.parentCommentId ?? undefined,
      questionId: dto.questionId,
      likeCount: 0,
    });
    await this.commentRepo.save(comment);
    return { message: '评论成功', id: comment.id };
  }

  async addCommentLike(dto: CommentLikeDto) {
    const exists = await this.likeRepo.findOne({
      where: { userId: dto.userId, commentId: dto.commentId },
    });
    if (exists) throw new BadRequestException('已点赞');

    await this.likeRepo.save(this.likeRepo.create({ userId: dto.userId, commentId: dto.commentId }));
    await this.commentRepo
      .createQueryBuilder()
      .update(Comment)
      .set({ likeCount: () => 'like_count + 1' })
      .where('id = :id', { id: dto.commentId })
      .execute();
    return { message: '点赞成功' };
  }

  async getComment(commentId: number) {
    const comment = await this.commentRepo.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('评论不存在');
    const user = await this.userRepo.findOne({ where: { id: comment.userId } });
    return { ...comment, userName: user?.username ?? '' };
  }

  async getComments(questionId: string, pageNum: number, pageSize: number, requestUserId?: string) {
    const [rootList, total] = await this.commentRepo.findAndCount({
      where: { questionId, parentCommentId: IsNull() },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
      order: { createTime: 'DESC' },
    });

    const result = await Promise.all(
      rootList.map(async (c) => {
        const user = await this.userRepo.findOne({ where: { id: c.userId } });
        const isLiked = requestUserId
          ? !!(await this.likeRepo.findOne({ where: { userId: requestUserId, commentId: c.id } }))
          : false;

        const children = await this.commentRepo.find({
          where: { parentCommentId: c.id },
          order: { createTime: 'ASC' },
        });
        const childComments = await Promise.all(
          children.map(async (child) => {
            const cu = await this.userRepo.findOne({ where: { id: child.userId } });
            const childLiked = requestUserId
              ? !!(await this.likeRepo.findOne({ where: { userId: requestUserId, commentId: child.id } }))
              : false;
            return { ...child, userName: cu?.username ?? '', isLiked: childLiked };
          }),
        );

        return { ...c, userName: user?.username ?? '', isLiked, childComments };
      }),
    );

    return { list: result, total, pageNum, pageSize };
  }

  async deleteComment(id: number) {
    const comment = await this.commentRepo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('评论不存在');
    await this.likeRepo.delete({ commentId: id });
    await this.commentRepo.delete({ parentCommentId: id });
    await this.commentRepo.delete({ id });
    return { message: '删除成功' };
  }

  async cancelCommentLike(dto: CancelCommentLikeDto) {
    const like = await this.likeRepo.findOne({
      where: { userId: dto.userId, commentId: dto.commentId },
    });
    if (!like) throw new BadRequestException('未点赞');
    await this.likeRepo.delete({ userId: dto.userId, commentId: dto.commentId });
    await this.commentRepo
      .createQueryBuilder()
      .update(Comment)
      .set({ likeCount: () => 'GREATEST(like_count - 1, 0)' })
      .where('id = :id', { id: dto.commentId })
      .execute();
    return { message: '取消点赞成功' };
  }
}
