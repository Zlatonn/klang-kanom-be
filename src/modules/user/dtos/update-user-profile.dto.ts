import { OmitType } from '@nestjs/mapped-types';
import { UpdateUserDto } from './update-user.dto';

export class UpdateUserProfileDto extends OmitType(UpdateUserDto, [
  'role',
] as const) {}
