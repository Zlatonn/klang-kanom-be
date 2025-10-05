import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsPositive,
  ValidateNested,
} from 'class-validator';

class OrderDto {
  @ApiProperty({ required: true, example: 1 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  menuId: number;

  @ApiProperty({ required: true, example: 10 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  quantity: number;
}

export class CreateClaimsDto {
  @ApiProperty({ type: [OrderDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderDto)
  @ArrayUnique((o) => o.menuId, { message: 'Each claim order must be unique.' })
  orders: OrderDto[];
}
