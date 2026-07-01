import { IsOptional, IsString } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  @IsOptional()
  name?: string;
}
