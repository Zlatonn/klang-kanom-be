import { OmitType } from '@nestjs/swagger';
import { UpdateUserDto } from './update-user.dto';

export class UpdateUserProfileDto extends OmitType(UpdateUserDto, [
  'role',
] as const) {}
