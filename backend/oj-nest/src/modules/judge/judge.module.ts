import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';
import { UserSubmissionRecord } from '../../entities/user-submission-record.entity';
import { JudgeProcessor } from './judge.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSubmissionRecord]),
    BullModule.registerQueue({ name: 'judge' }),
    HttpModule,
  ],
  providers: [JudgeProcessor],
})
export class JudgeModule {}
