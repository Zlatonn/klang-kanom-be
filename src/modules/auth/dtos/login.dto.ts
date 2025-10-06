import { ApiProperty } from '@nestjs/swagger';
import { IsHash, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ required: true, example: 'johndoe' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ required: true, example: 'hashed_password' })
  @IsNotEmpty()
  @IsString()
  @IsHash('sha1')
  password: string;
}
