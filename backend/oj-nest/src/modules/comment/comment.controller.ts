import { Body, Controller, Delete, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CancelCommentLikeDto, CommentDto, CommentLikeDto } from './dto/comment.dto';
import { TokenGuard } from '../../common/guards/token.guard';

@UseGuards(TokenGuard)
@Controller('api/comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('addComment')
  addComment(@Body() dto: CommentDto) {
    return this.commentService.addComment(dto);
  }

  @Post('addCommentLike')
  addLike(@Body() dto: CommentLikeDto) {
    return this.commentService.addCommentLike(dto);
  }

  @Get('getComment')
  getComment(@Query('commentId') commentId: number) {
    return this.commentService.getComment(+commentId);
  }

  @Get('getComments')
  getComments(
    @Query('questionId') questionId: string,
    @Query('pageNum') pageNum: number,
    @Query('pageSize') pageSize: number,
    @Query('userId') userId?: string,
  ) {
    return this.commentService.getComments(questionId, +pageNum || 1, +pageSize || 10, userId);
  }

  @Delete('deleteComment')
  deleteComment(@Query('id') id: number) {
    return this.commentService.deleteComment(+id);
  }

  @Delete('cancelCommentLike')
  cancelLike(@Body() dto: CancelCommentLikeDto) {
    return this.commentService.cancelCommentLike(dto);
  }
}
