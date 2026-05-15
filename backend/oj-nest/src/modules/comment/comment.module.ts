import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../../entities/comment.entity';
import { CommentLike } from '../../entities/comment-like.entity';
import { User } from '../../entities/user.entity';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, CommentLike, User])],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
