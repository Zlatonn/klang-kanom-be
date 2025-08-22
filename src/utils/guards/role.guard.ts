import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from '../decorators/role.decorator';

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
    const user = req.user;

    if (!user || !user.role) {
      throw new ForbiddenException('User has not role');
    }

    const hasAcces = requireRole.include(user.role);
    if (!hasAcces) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
