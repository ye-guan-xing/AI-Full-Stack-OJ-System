import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@nestjs-modules/ioredis';
import { BullModule } from '@nestjs/bull';
import { databaseConfig } from './config/database.config';
import { redisConfig } from './config/redis.config';
import { UserModule } from './modules/user/user.module';
import { QuestionModule } from './modules/question/question.module';
import { CommentModule } from './modules/comment/comment.module';
import { JudgeModule } from './modules/judge/judge.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: databaseConfig,
    }),
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: redisConfig,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        redis: {
          host: cs.get('REDIS_HOST'),
          port: cs.get<number>('REDIS_PORT'),
          password: cs.get('REDIS_PASSWORD'),
          db: cs.get<number>('REDIS_DB') ?? 0,
        },
      }),
    }),
    UserModule,
    QuestionModule,
    CommentModule,
    JudgeModule,
  ],
})
export class AppModule {}
