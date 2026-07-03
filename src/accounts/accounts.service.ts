import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Repository } from 'typeorm';
import { AccountsType } from '../common/enums/accountsType.enum';
import { Class } from '../classes/entities/class.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
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
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findAll(
    filter: { directorsOnly?: boolean } = {},
  ): Promise<AccountWithProfile[]> {
    if (filter.directorsOnly) {
      const directors = await this.teacherRepository.find({
        where: { director: IsNull() },
      });
      const accounts = await this.accountRepository.find({
        where: { id: In(directors.map((director) => director.id)) },
      });
      const accountsById = new Map(
        accounts.map((account) => [account.id, account]),
      );

      return directors
        .map((director): AccountWithProfile | undefined => {
          const account = accountsById.get(director.id);
          return account ? { ...account, profile: director } : undefined;
        })
        .filter(
          (account): account is AccountWithProfile => account !== undefined,
        );
    }

    const [accounts, students, teachers] = await Promise.all([
      this.accountRepository.find(),
      this.studentRepository.find({ relations: { class: true } }),
      this.teacherRepository.find({ relations: { director: true } }),
    ]);

    const studentsById = new Map(
      students.map((student) => [student.id, student]),
    );
    const teachersById = new Map(
      teachers.map((teacher) => [teacher.id, teacher]),
    );

    return accounts.map((account) => ({
      ...account,
      profile:
        account.type === AccountsType.Student
          ? studentsById.get(account.id)
          : teachersById.get(account.id),
    })) as AccountWithProfile[];
  }

  async findOne(id: string): Promise<AccountWithProfile> {
    const account = await this.accountRepository.findOne({ where: { id } });
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    const profile =
      account.type === AccountsType.Student
        ? await this.studentRepository.findOne({
            where: { id },
            relations: { class: true },
          })
        : await this.teacherRepository.findOne({
            where: { id },
            relations: { director: true },
          });

    return { ...account, profile } as AccountWithProfile;
  }

  async update(
    id: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<AccountWithProfile> {
    const account = await this.accountRepository.findOne({ where: { id } });
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    const { email, first_name, last_name, classId, directorId } =
      updateAccountDto;

    return await this.dataSource.transaction(async (manager) => {
      if (email !== undefined) {
        account.email = email;
        await manager.save(account);
      }

      if (account.type === AccountsType.Student) {
        const student = await manager.findOne(Student, {
          where: { id },
          relations: { class: true },
        });
        if (!student) {
          throw new NotFoundException(
            `Student profile for account ${id} not found`,
          );
        }

        if (first_name !== undefined) student.first_name = first_name;
        if (last_name !== undefined) student.last_name = last_name;
        if (classId !== undefined) {
          const studentClass = await manager.findOne(Class, {
            where: { id: classId },
          });
          if (!studentClass) {
            throw new NotFoundException(`Class with ID ${classId} not found`);
          }
          student.class = studentClass;
        }
        await manager.save(student);

        return { ...account, profile: student };
      }

      const teacher = await manager.findOne(Teacher, {
        where: { id },
        relations: { director: true },
      });
      if (!teacher) {
        throw new NotFoundException(
          `Teacher profile for account ${id} not found`,
        );
      }

      if (first_name !== undefined) teacher.first_name = first_name;
      if (last_name !== undefined) teacher.last_name = last_name;
      await manager.save(teacher);

      if (directorId !== undefined) {
        if (directorId === null) {
          await manager
            .createQueryBuilder(Teacher, 'teacher')
            .relation('director')
            .of(teacher.id)
            .set(null);
          teacher.director = undefined;
        } else {
          const director = await manager.findOne(Teacher, {
            where: { id: directorId },
          });
          if (!director) {
            throw new NotFoundException(
              `Teacher with ID ${directorId} not found`,
            );
          }
          await manager
            .createQueryBuilder(Teacher, 'teacher')
            .relation('director')
            .of(teacher.id)
            .set(director.id);
          teacher.director = director;
        }
      }

      return { ...account, profile: teacher };
    });
  }

  async create(
    createAccountDto: CreateAccountDto,
  ): Promise<AccountWithProfile> {
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
