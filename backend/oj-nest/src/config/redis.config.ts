import { ConfigService } from '@nestjs/config';
import { RedisModuleOptions } from '@nestjs-modules/ioredis';

export const redisConfig = (cs: ConfigService): RedisModuleOptions => ({
  type: 'single',
  url: `redis://:${cs.get('REDIS_PASSWORD')}@${cs.get('REDIS_HOST')}:${cs.get('REDIS_PORT')}/${cs.get('REDIS_DB') ?? 0}`,
});
