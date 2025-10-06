import { ApiProperty } from '@nestjs/swagger';
import { MenuType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateMenuDto {
  @ApiProperty({ required: true, example: 'example_snack' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: true, enum: MenuType, example: 'SNACK' })
  @IsNotEmpty()
  @IsEnum(MenuType)
  menuType: MenuType;

  @ApiProperty({ required: true, example: 10 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ required: true, type: 'string', format: 'binary' })
  @IsOptional()
  @IsString()
  file?: string;
}
