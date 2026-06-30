import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  @IsOptional()
  name?: string;
}
