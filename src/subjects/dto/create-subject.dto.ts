import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  /**
   * ID of the teacher who owns (and can delete) the subject.
   */
  @IsUUID()
  @IsNotEmpty()
  ownerId: string;
}
