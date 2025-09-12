import { Transform, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';
import { getEndDate, getStartDate } from 'src/utils/helpers/date.helper';

export class GetTopClaimDto {
  @IsNotEmpty()
  @Transform(({ value }) => getStartDate(value))
  startDate: Date;

  @IsNotEmpty()
  @Transform(({ value }) => getEndDate(value))
  endDate: Date;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  take?: number;
}
