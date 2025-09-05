import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    console.log(exception);

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = new InternalServerErrorException().getResponse()['message'];

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      message = exception.getResponse()['message'];
    }

    response.status(httpStatus).json({
      statusCode: httpStatus,
      success: false,
      errorMessage: message,
      timeStamp: new Date().toString(),
      path: request.url,
    });
  }
}
