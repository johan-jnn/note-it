import { IsEmail, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateAccountDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsOptional()
  last_name?: string;

  /** Only applies to student accounts. */
  @IsInt()
  @IsOptional()
  classId?: number;

  /**
   * Only applies to teacher accounts. Send `null` to remove the current
   * director (the teacher then becomes a director themselves); omit the
   * field entirely to leave the director unchanged.
   */
  @IsUUID()
  @IsOptional()
  directorId?: string | null;
}
