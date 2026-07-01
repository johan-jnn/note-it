import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateGradeDto {
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @IsString()
  @IsOptional()
  comment?: string;
}
