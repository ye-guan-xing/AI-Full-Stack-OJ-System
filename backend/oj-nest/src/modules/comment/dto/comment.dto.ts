import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CommentDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsOptional()
  parentCommentId?: number;

  @IsString()
  @IsNotEmpty()
  questionId: string;
}

export class CommentLikeDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @IsNotEmpty()
  commentId: number;
}

export class CancelCommentLikeDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @IsNotEmpty()
  commentId: number;
}
