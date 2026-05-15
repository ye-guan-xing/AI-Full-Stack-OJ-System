import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const message = typeof res === 'string' ? res : (res as any).message;
      response.status(status).json({ code: status, message, data: null });
    } else {
      console.error(exception);
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: 500,
        message: '服务器内部错误',
        data: null,
      });
    }
  }
}
