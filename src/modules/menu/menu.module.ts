import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from '../../utils/configs/multer.config';

@Module({
  imports: [
    PrismaModule,
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
  ],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
