import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfig } from './jwt/jwt.config';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      global: true,
      useClass: JwtConfig,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
