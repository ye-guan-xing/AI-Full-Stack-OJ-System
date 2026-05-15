import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(_ctx: ExecutionContext, next: CallHandler<T>): Observable<any> {
    return next
      .handle()
      .pipe(
        map((data) => ({ code: 1, message: 'success', data: data ?? null })),
      );
  }
}
