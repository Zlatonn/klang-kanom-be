import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegistorDTO } from './dtos/registor.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() req: LoginDto) {
    return this.authService.login(req);
  }

  @Post('registor')
  registor(@Body() req: RegistorDTO) {
    return this.authService.registor(req);
  }
}
