import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { IsAfterDate } from '../../common/validators/is-after-date.validator';

export class CreateAssignmentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString()
  @IsOptional()
  begin_date?: Date;

  @IsDateString()
  @IsOptional()
  @IsAfterDate('begin_date', {
    message: 'end_date must be after begin_date',
  })
  end_date?: Date;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  scale: number;

  @IsPositive()
  @IsOptional()
  coefficient?: number;

  @IsInt()
  @IsNotEmpty()
  lessonId: number;
}
