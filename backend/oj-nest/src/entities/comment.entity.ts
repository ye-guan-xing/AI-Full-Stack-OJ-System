import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'parent_comment_id', type: 'int', nullable: true })
  parentCommentId: number;

  @Column({ name: 'question_id', type: 'varchar' })
  questionId: string;

  @Column({ name: 'like_count', type: 'int', default: 0 })
  likeCount: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
