import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString()
  @IsOptional()
  begin_date?: Date;

  @IsDateString()
  @IsOptional()
  end_date?: Date;

  @IsNumber()
  @IsNotEmpty()
  scale: number;

  @IsNumber()
  @IsOptional()
  coefficient?: number;
}
