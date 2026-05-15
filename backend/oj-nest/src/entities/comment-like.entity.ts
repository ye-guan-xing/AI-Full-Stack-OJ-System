import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('comment_likes')
export class CommentLike {
  @PrimaryColumn({ name: 'user_id', type: 'varchar' })
  userId: string;

  @PrimaryColumn({ name: 'comment_id', type: 'int' })
  commentId: number;

  @CreateDateColumn({ name: 'liked_time' })
  likedTime: Date;
}
