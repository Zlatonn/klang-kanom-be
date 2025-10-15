import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty } from 'class-validator';
import {
  formatDateYYYYMMDD,
  getEndDate,
  getStartDate,
} from 'src/utils/helpers/date.helper';

export class GetClaimsDashboardPositionDto {
  @ApiProperty({ required: true, example: formatDateYYYYMMDD(new Date()) })
  @IsNotEmpty()
  @Transform(({ value }) => getStartDate(value))
  @IsDate()
  startDate: Date;

  @ApiProperty({ required: true, example: formatDateYYYYMMDD(new Date()) })
  @IsNotEmpty()
  @Transform(({ value }) => getEndDate(value))
  @IsDate()
  endDate: Date;
}
