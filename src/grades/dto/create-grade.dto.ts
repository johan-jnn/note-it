import { IsNumber, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateGradeDto {
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @IsString()
  @IsOptional()
  comment?: string;
}
