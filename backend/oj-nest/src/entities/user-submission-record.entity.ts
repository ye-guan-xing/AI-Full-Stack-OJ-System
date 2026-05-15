import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('user_submission_record')
export class UserSubmissionRecord {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  @Column({ name: 'question_id', type: 'varchar' })
  questionId: string;

  @Column({ name: 'code_id', type: 'varchar' })
  codeId: string;

  @Column({ type: 'varchar', nullable: true })
  result: string;

  @Column({ type: 'varchar', nullable: true })
  time: string;

  @Column({ type: 'varchar', nullable: true })
  memory: string;

  @Column({ type: 'varchar', nullable: true })
  language: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
