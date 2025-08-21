import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { SkipAuth } from 'src/utils/decorators/skip-auth';

@SkipAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() req: LoginDto) {
    return this.authService.login(req);
  }

  @Post('register')
  register(@Body() req: RegisterDto) {
    return this.authService.register(req);
  }
}
