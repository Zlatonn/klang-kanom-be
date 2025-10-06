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
import { ApiProperty } from '@nestjs/swagger';

export class GetUsersDto {
  @ApiProperty({ required: true, example: 1 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page: number;

  @ApiProperty({ required: true, example: 10 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  take: number;

  @ApiProperty({ required: false, enum: Position })
  @IsOptional()
  @IsEnum(Position)
  position?: Position;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;
}
