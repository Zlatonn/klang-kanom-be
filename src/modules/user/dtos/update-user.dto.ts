import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { Position, Role } from '@prisma/client';
import { REGEX_PHONE_NUMBER } from 'src/common/constants/regex';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ required: false, example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false, example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false, example: '012-345-6789' })
  @IsOptional()
  @IsString()
  @Matches(REGEX_PHONE_NUMBER, {
    message: 'Phone must be in the format XXX-XXX-XXXX',
  })
  phoneNumber?: string;

  @ApiProperty({ required: false, enum: Position, example: 'INTERN' })
  @IsOptional()
  @IsEnum(Position)
  position?: Position;

  @ApiProperty({ required: false, enum: Role, example: 'USER' })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  @IsOptional()
  @IsString()
  file?: string;
}
