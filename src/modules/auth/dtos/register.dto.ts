import { IsEnum, IsHash, IsNotEmpty, IsString, Matches } from 'class-validator';
import { Position } from '@prisma/client';
import { REGEX_PHONE_NUMBER } from 'src/common/constants/regex';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  @IsHash('sha1')
  password: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  @Matches(REGEX_PHONE_NUMBER, {
    message: 'Phone must be in the format XXX-XXX-XXXX',
  })
  phoneNumber: string;

  @IsNotEmpty()
  @IsEnum(Position)
  position: Position;
}
