import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateGradeDto {
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsInt()
  @IsNotEmpty()
  assignmentId: number;

  @IsUUID()
  @IsNotEmpty()
  studentId: string;
}
