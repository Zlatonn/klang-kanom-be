import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class GetTopClaimDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  take?: number;
}
