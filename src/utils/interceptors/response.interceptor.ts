import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ResponseInterface } from 'src/interfaces/response.interface';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ResponseInterface<T, null>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ResponseInterface<T, null>> {
    const response = context.switchToHttp().getResponse();
    return next.handle().pipe(
      map(
        (data: T): ResponseInterface<T, null> => ({
          statusCode: response.statusCode,
          success: true,
          data,
          timestamp: new Date().toString(),
        }),
      ),
    );
  }
}
