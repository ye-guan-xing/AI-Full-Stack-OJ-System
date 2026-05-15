import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { Request } from 'express';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('未携带Token，请先登录');
    }
    const exists = await this.redis.exists(token);
    if (!exists) {
      throw new UnauthorizedException('Token无效或已过期，请重新登录');
    }
    request['token'] = token;
    return true;
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }
    const tokenHeader = request.headers['token'] as string;
    if (tokenHeader) return tokenHeader.trim();
    return null;
  }
}
