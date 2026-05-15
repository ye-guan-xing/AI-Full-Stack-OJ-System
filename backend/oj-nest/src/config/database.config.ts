import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { Questions } from '../entities/questions.entity';
import { TestPoint } from '../entities/test-point.entity';
import { UserSubmissionCode } from '../entities/user-submission-code.entity';
import { UserSubmissionRecord } from '../entities/user-submission-record.entity';
import { Comment } from '../entities/comment.entity';
import { CommentLike } from '../entities/comment-like.entity';

export const databaseConfig = (cs: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: cs.get('DB_HOST'),
  port: cs.get<number>('DB_PORT'),
  username: cs.get('DB_USERNAME'),
  password: cs.get('DB_PASSWORD'),
  database: cs.get('DB_DATABASE'),
  entities: [User, Questions, TestPoint, UserSubmissionCode, UserSubmissionRecord, Comment, CommentLike],
  synchronize: false,
});
