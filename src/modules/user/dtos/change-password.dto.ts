import { ApiProperty } from '@nestjs/swagger';
import { IsHash, IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ required: true, example: 'hashed_password' })
  @IsNotEmpty()
  @IsString()
  @IsHash('sha1')
  oldPassword: string;

  @ApiProperty({ required: true, example: 'new_hashed_password' })
  @IsNotEmpty()
  @IsString()
  @IsHash('sha1')
  newPassword: string;
}
