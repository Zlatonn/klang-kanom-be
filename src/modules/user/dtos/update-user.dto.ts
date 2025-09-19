import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { Position, Role } from '@prisma/client';
import { REGEX_PHONE_NUMBER } from 'src/common/constants/regex';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  @Matches(REGEX_PHONE_NUMBER, {
    message: 'Phone must be in the format XXX-XXX-XXXX',
  })
  phoneNumber?: string;

  @IsOptional()
  @IsEnum(Position)
  position?: Position;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
