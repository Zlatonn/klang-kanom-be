import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayload } from 'src/interfaces/user.payload.interface';

export const User = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    const user: UserPayload = req.user;

    return data ? user?.[data] : user;
  },
);
