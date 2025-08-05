import { SetMetadata } from '@nestjs/common';

export const IS_PUBlIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBlIC_KEY, true);
