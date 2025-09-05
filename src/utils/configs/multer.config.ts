import { BadRequestException, Injectable } from '@nestjs/common';
import { MulterOptionsFactory } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import * as path from 'path';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  createMulterOptions(): MulterOptions {
    return {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, 'public/images');
        },
        filename: (req, file, cb) => {
          const imageName = `${randomUUID()}${path.extname(file.originalname)}`;
          cb(null, imageName);
        },
      }),

      limits: { fileSize: 1024 * 1024 * 5 },

      fileFilter: (req, file, cb) => {
        const allowed = /^image\/(jpeg|jpg|png|webp)$/.test(file.mimetype);
        if (!allowed) {
          return cb(
            new BadRequestException(
              'Only JPG, JPEG, PNG, and WEBP file formats are allowed.',
            ),
            false,
          );
        }
        cb(null, true);
      },
    };
  }
}
