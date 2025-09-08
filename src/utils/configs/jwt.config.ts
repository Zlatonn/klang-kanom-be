import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';

@Injectable()
export class JwtConfig implements JwtOptionsFactory {
  constructor(private readonly config: ConfigService) {}
  createJwtOptions(): Promise<JwtModuleOptions> | JwtModuleOptions {
    return {
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
      signOptions: { expiresIn: this.config.getOrThrow<string>('JWT_EXPIRE') },
    };
  }
}
