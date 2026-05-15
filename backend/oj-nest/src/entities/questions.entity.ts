import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('questions')
export class Questions {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  label: string;

  @Column({ name: 'test_point_num', type: 'int', default: 0 })
  testPointNum: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'limited_time', type: 'bigint', nullable: true })
  limitedTime: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
