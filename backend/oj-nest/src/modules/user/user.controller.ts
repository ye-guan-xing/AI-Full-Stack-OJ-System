import { Body, Controller, Get, Headers, Post, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ChangePasswordDto, LoginDto, RegisterDto, UpdateUserInfoDto } from './dto/user.dto';
import { TokenGuard } from '../../common/guards/token.guard';
import { CurrentToken } from '../../common/decorators/current-token.decorator';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.userService.login(dto);
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.userService.register(dto);
  }

  @Post('logout')
  logout(@Headers('token') token: string) {
    return this.userService.logout(token);
  }

  @Post('changePassword')
  changePassword(
    @Headers('authorization') auth: string,
    @Body() dto: ChangePasswordDto,
  ) {
    const token = auth?.startsWith('Bearer ') ? auth.substring(7).trim() : auth;
    return this.userService.changePassword(token, dto);
  }

  @Put('info')
  updateUserInfo(
    @Headers('authorization') auth: string,
    @Body() dto: UpdateUserInfoDto,
  ) {
    const token = auth?.startsWith('Bearer ') ? auth.substring(7).trim() : auth;
    return this.userService.updateUserInfo(token, dto);
  }

  @Get('status')
  getUserStatus(@Headers('authorization') auth: string) {
    const token = auth?.startsWith('Bearer ') ? auth.substring(7).trim() : auth;
    return this.userService.getUserStatus(token);
  }
}
