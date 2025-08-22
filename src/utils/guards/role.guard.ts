import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from '../decorators/role.decorator';
import { Role } from '@prisma/client';
import { UserPayload } from 'src/interfaces/user.payload.interface';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireRole = this.reflector.getAllAndOverride(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requireRole) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const user: UserPayload = req.user;

    const hasAccess = requireRole.include(user.role);
    if (!hasAccess) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
