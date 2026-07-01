import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsNotEmpty()
  classId: number;

  @IsUUID()
  @IsNotEmpty()
  teacherId: string;

  @IsInt()
  @IsNotEmpty()
  subjectId: number;
}
