import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AccountsType } from '../common/enums/accountsType.enum';
import { Class } from '../classes/entities/class.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { Account } from './entities/account.entity';
import { Student } from './entities/student.entity';
import { Teacher } from './entities/teacher.entity';

export type AccountWithProfile = Account & {
  profile: Student | Teacher;
};

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<AccountWithProfile> {
    const { email, type, first_name, last_name, classId, directorId } =
      createAccountDto;

    if (type === AccountsType.Student) {
      const studentClass = await this.classRepository.findOne({
        where: { id: classId },
      });
      if (!studentClass) {
        throw new NotFoundException(`Class with ID ${classId} not found`);
      }

      return await this.dataSource.transaction(async (manager) => {
        const account = await manager.save(
          manager.create(Account, { email, type }),
        );
        const student = await manager.save(
          manager.create(Student, {
            id: account.id,
            first_name,
            last_name,
            class: studentClass,
          }),
        );
        return { ...account, profile: student };
      });
    }

    let director: Teacher | null = null;
    if (directorId) {
      director = await this.teacherRepository.findOne({
        where: { id: directorId },
      });
      if (!director) {
        throw new NotFoundException(`Teacher with ID ${directorId} not found`);
      }
    }

    return await this.dataSource.transaction(async (manager) => {
      const account = await manager.save(
        manager.create(Account, { email, type }),
      );
      const teacher = await manager.save(
        manager.create(Teacher, {
          id: account.id,
          first_name,
          last_name,
          director: director ?? undefined,
        }),
      );
      return { ...account, profile: teacher };
    });
  }
}
