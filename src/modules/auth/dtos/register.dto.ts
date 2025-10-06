import { IsEnum, IsHash, IsNotEmpty, IsString, Matches } from 'class-validator';
import { Position } from '@prisma/client';
import { REGEX_PHONE_NUMBER } from 'src/common/constants/regex';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ required: true, example: 'johndoe' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ required: true, example: 'hashed_password' })
  @IsNotEmpty()
  @IsString()
  @IsHash('sha1')
  password: string;

  @ApiProperty({ required: true, example: 'John' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ required: true, example: 'Doe' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ required: true, example: '012-345-6789' })
  @IsNotEmpty()
  @IsString()
  @Matches(REGEX_PHONE_NUMBER, {
    message: 'Phone must be in the format XXX-XXX-XXXX',
  })
  phoneNumber: string;

  @ApiProperty({ enum: Position, required: true, example: 'INTERN' })
  @IsNotEmpty()
  @IsEnum(Position)
  position: Position;
}
