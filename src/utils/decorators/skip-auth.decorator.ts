import { SetMetadata } from '@nestjs/common';

export const IS_PUBlIC_KEY = 'isPublic';
export const SkipAuth = () => SetMetadata(IS_PUBlIC_KEY, true);
