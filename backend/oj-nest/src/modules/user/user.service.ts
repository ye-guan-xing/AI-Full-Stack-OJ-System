import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../entities/user.entity';
import { ChangePasswordDto, LoginDto, RegisterDto, UpdateUserInfoDto } from './dto/user.dto';

@Injectable()
export class UserService {
  private readonly tokenTtl: number;

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRedis() private readonly redis: Redis,
    private readonly cs: ConfigService,
  ) {
    this.tokenTtl = cs.get<number>('TOKEN_TTL') ?? 3600;
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { username: dto.username } });
    if (!user) throw new NotFoundException('用户不存在');

    const md5Pass = CryptoJS.MD5(dto.password).toString();
    if (user.password !== md5Pass) throw new UnauthorizedException('密码错误');

    const token = CryptoJS.MD5(dto.username + dto.password).toString();
    await this.redis.set(token, user.username, 'EX', this.tokenTtl);

    return {
      message: '登录成功',
      id: user.id,
      username: user.username,
      token,
      roles: user.roles,
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { username: dto.username } });
    if (existing) throw new BadRequestException('用户名已存在');

    const user = this.userRepo.create({
      id: uuidv4(),
      username: dto.username,
      password: CryptoJS.MD5(dto.password).toString(),
      roles: 'user',
    });
    await this.userRepo.save(user);
    return { id: user.id, username: user.username, message: '注册成功' };
  }

  async logout(token: string) {
    await this.redis.del(token);
    return { message: '已退出登录' };
  }

  async changePassword(token: string, dto: ChangePasswordDto) {
    const username = await this.redis.get(token);
    if (!username) throw new UnauthorizedException('Token无效');

    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('用户不存在');

    const oldMd5 = CryptoJS.MD5(dto.oldPassword).toString();
    if (user.password !== oldMd5) throw new BadRequestException('旧密码错误');

    user.password = CryptoJS.MD5(dto.newPassword).toString();
    await this.userRepo.save(user);

    await this.redis.del(token);
    return { message: '密码修改成功，请重新登录' };
  }

  async updateUserInfo(token: string, dto: UpdateUserInfoDto) {
    const username = await this.redis.get(token);
    if (!username) throw new UnauthorizedException('Token无效');

    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('用户不存在');

    const nameTaken = await this.userRepo.findOne({ where: { username: dto.username } });
    if (nameTaken && nameTaken.id !== user.id) throw new BadRequestException('用户名已被使用');

    user.username = dto.username;
    await this.userRepo.save(user);
    return { message: '更新成功', username: user.username };
  }

  async getUserStatus(token: string) {
    const username = await this.redis.get(token);
    if (!username) throw new UnauthorizedException('Token无效');

    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('用户不存在');

    return { id: user.id, username: user.username, roles: user.roles };
  }
}
