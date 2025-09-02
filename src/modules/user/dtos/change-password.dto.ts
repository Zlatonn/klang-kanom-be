import { IsHash, IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  @IsHash('sha1')
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  @IsHash('sha1')
  newPassword: string;
}
