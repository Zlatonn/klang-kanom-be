import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { Position, Role } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{3}-\d{3}-\d{4}$/, {
    message: 'Phone must be in the format XXX-XXX-XXXX',
  })
  phoneNumber: string;

  @IsOptional()
  @IsEnum(Position)
  position: Position;

  @IsOptional()
  @IsEnum(Role)
  role: Role;
}
