import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { AccountsType } from '../../common/enums/accountsType.enum';

export class CreateAccountDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(AccountsType)
  @IsNotEmpty()
  type: AccountsType;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  /**
   * Required when `type` is `student`: the class the student belongs to.
   */
  @ValidateIf((dto: CreateAccountDto) => dto.type === AccountsType.Student)
  @IsInt()
  @IsNotEmpty()
  classId?: number;

  /**
   * Only used when `type` is `teacher`. If omitted, the teacher has no
   * director and is therefore considered a director themselves.
   */
  @ValidateIf((dto: CreateAccountDto) => dto.type === AccountsType.Teacher)
  @IsUUID()
  @IsOptional()
  directorId?: string;
}
