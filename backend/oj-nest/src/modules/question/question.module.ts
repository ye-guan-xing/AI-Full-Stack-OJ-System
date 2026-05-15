import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Questions } from '../../entities/questions.entity';
import { TestPoint } from '../../entities/test-point.entity';
import { UserSubmissionCode } from '../../entities/user-submission-code.entity';
import { UserSubmissionRecord } from '../../entities/user-submission-record.entity';
import { AdminQuestionController } from './admin-question.controller';
import { UserQuestionController } from './user-question.controller';
import { QuestionService } from './question.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Questions, TestPoint, UserSubmissionCode, UserSubmissionRecord]),
    BullModule.registerQueue({ name: 'judge' }),
  ],
  controllers: [AdminQuestionController, UserQuestionController],
  providers: [QuestionService],
})
export class QuestionModule {}
