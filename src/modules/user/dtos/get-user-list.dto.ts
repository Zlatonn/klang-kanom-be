import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Position } from '@prisma/client';

export class GetUserListDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  take: number;

  @IsOptional()
  @IsEnum(Position)
  position?: Position;

  @IsOptional()
  @IsString()
  search?: string;
}
