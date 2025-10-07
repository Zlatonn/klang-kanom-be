import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { getImageDirectory, safeUnlink } from 'src/utils/helpers/file.helper';
import { readdir } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  constructor(private readonly prismaService: PrismaService) {}

  @Cron('* * * * * *')
  async cleanupUnlinkedImages() {
    const userImages = await this.prismaService.user.findMany({
      where: {
        imageName: {
          not: null,
        },
      },
      select: {
        imageName: true,
      },
    });

    const menuImages = await this.prismaService.menu.findMany({
      select: {
        imageName: true,
      },
    });

    const linkedImages = userImages.concat(menuImages).map((e) => e.imageName);

    const imageDir = getImageDirectory();
    const files = await readdir(imageDir);
    const unlinkedImages = files.filter((file) => !linkedImages.includes(file));

    if (unlinkedImages.length === 0) {
      this.logger.log('Cleanup unlinked images: no unlinked images');
      return;
    }

    for (const file of unlinkedImages) {
      if (file) {
        const imagePath = join(imageDir, file);
        safeUnlink(imagePath);
        this.logger.log(
          `Cleanup unlinked images: ${unlinkedImages.length} files deleted`,
        );
      }
    }
  }
}
