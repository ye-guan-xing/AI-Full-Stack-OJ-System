import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { QuestionService } from './question.service';
import { SubmitTestQuestionDto } from './dto/question.dto';
import { TokenGuard } from '../../common/guards/token.guard';

@UseGuards(TokenGuard)
@Controller('api/user/testQuestion')
export class UserQuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get('getTestQuestionByPage')
  getByPage(
    @Query('pageNum') pageNum: number,
    @Query('size') size: number,
    @Query('keyword') keyword: string,
  ) {
    return this.questionService.getByPage(+pageNum || 1, +size || 10, keyword ?? '');
  }

  @Get('getTestQuestionById')
  getById(@Query('id') id: string) {
    return this.questionService.getById(id);
  }

  @Get('getTestQuestionByName')
  getByName(@Query('name') name: string) {
    return this.questionService.getByName(name);
  }

  @Get('getTestPointsListByQuestionId')
  getTestPoints(@Query('id') id: string) {
    return this.questionService.getTestPointsByQuestionId(id);
  }

  @Post('submitTestQuestion')
  submit(@Body() dto: SubmitTestQuestionDto) {
    return this.questionService.submitTestQuestion(dto);
  }
}
