import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { SkipAuth } from 'src/utils/decorators/skip-auth.decorator';
import { ApiOperation } from '@nestjs/swagger';

@SkipAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with username & password' })
  login(@Body() req: LoginDto) {
    return this.authService.login(req);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  register(@Body() req: RegisterDto) {
    return this.authService.register(req);
  }
}
