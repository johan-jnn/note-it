import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateGradeDto {
  @IsNumber()
  @Min(0)
  @Max(20)
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
