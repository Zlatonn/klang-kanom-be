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
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  menuId: number;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  quantity: number;
}

export class CreateClaimDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderDto)
  @ArrayUnique((o) => o.menuId, { message: 'Each claim order must be unique.' })
  orders: OrderDto[];
}
