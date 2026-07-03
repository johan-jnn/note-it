import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { In, IsNull } from 'typeorm';
import { Class } from '../classes/entities/class.entity';
import { AccountsType } from '../common/enums/accountsType.enum';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from './entities/account.entity';
import { Student } from './entities/student.entity';
import { Teacher } from './entities/teacher.entity';

describe('AccountsService', () => {
  let service: AccountsService;

  const mockClassRepository = {
    findOne: jest.fn(),
  };
  const mockAccountRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };
  const mockStudentRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };
  const mockTeacherRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };
  const mockRelationQueryBuilder = {
    relation: jest.fn().mockReturnThis(),
    of: jest.fn().mockReturnThis(),
    set: jest.fn().mockResolvedValue(undefined),
  };
  const mockManager = {
    create: jest.fn(
      (entity: typeof Account, data) =>
        Object.assign(
          new Account(),
          entity === Account
            ? { id: 'new-account-uuid', ...data }
            : { ...data },
        ) as Account,
    ),
    save: jest.fn((data) => Promise.resolve(data)),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => mockRelationQueryBuilder),
  };
  const mockDataSource = {
    transaction: jest.fn((cb: (manager: typeof mockManager) => unknown) =>
      cb(mockManager),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        { provide: getRepositoryToken(Class), useValue: mockClassRepository },
        {
          provide: getRepositoryToken(Account),
          useValue: mockAccountRepository,
        },
        {
          provide: getRepositoryToken(Student),
          useValue: mockStudentRepository,
        },
        {
          provide: getRepositoryToken(Teacher),
          useValue: mockTeacherRepository,
        },
        { provide: getDataSourceToken(), useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create (student)', () => {
    const createDto: CreateAccountDto = {
      email: 'student@example.com',
      type: AccountsType.Student,
      first_name: 'John',
      last_name: 'Doe',
      classId: 1,
    };

    it('should create an account and a student profile', async () => {
      const mockClass = { id: 1, name: 'Class A' } as Class;
      mockClassRepository.findOne.mockResolvedValue(mockClass);

      const result = await service.create(createDto);

      expect(mockClassRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockManager.create).toHaveBeenCalledWith(Account, {
        email: createDto.email,
        type: createDto.type,
      });
      expect(result.id).toEqual('new-account-uuid');
      expect(result.profile).toMatchObject({
        first_name: 'John',
        last_name: 'Doe',
        class: mockClass,
      });
    });

    it('should throw NotFoundException if the class does not exist', async () => {
      mockClassRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockDataSource.transaction).not.toHaveBeenCalled();
    });
  });

  describe('create (teacher)', () => {
    it('should create a teacher account without a director', async () => {
      const createDto: CreateAccountDto = {
        email: 'teacher@example.com',
        type: AccountsType.Teacher,
        first_name: 'Jane',
        last_name: 'Smith',
      };

      const result = await service.create(createDto);

      expect(mockTeacherRepository.findOne).not.toHaveBeenCalled();
      expect(result.profile).toMatchObject({
        first_name: 'Jane',
        last_name: 'Smith',
        director: undefined,
      });
    });

    it('should attach the director when directorId is provided', async () => {
      const mockDirector = { id: 'director-uuid' } as Teacher;
      mockTeacherRepository.findOne.mockResolvedValue(mockDirector);

      const createDto: CreateAccountDto = {
        email: 'teacher2@example.com',
        type: AccountsType.Teacher,
        first_name: 'Jane',
        last_name: 'Smith',
        directorId: 'director-uuid',
      };

      const result = await service.create(createDto);

      expect(mockTeacherRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'director-uuid' },
      });
      expect(result.profile).toMatchObject({ director: mockDirector });
    });

    it('should throw NotFoundException if the director does not exist', async () => {
      mockTeacherRepository.findOne.mockResolvedValue(null);

      const createDto: CreateAccountDto = {
        email: 'teacher3@example.com',
        type: AccountsType.Teacher,
        first_name: 'Jane',
        last_name: 'Smith',
        directorId: 'missing-uuid',
      };

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockDataSource.transaction).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a student account with its profile', async () => {
      const account = {
        id: 'student-uuid',
        email: 'student@example.com',
        type: AccountsType.Student,
      } as Account;
      const student = {
        id: 'student-uuid',
        first_name: 'John',
        last_name: 'Doe',
      } as Student;

      mockAccountRepository.findOne.mockResolvedValue(account);
      mockStudentRepository.findOne.mockResolvedValue(student);

      const result = await service.findOne('student-uuid');

      expect(mockAccountRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'student-uuid' },
      });
      expect(mockStudentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'student-uuid' },
        relations: { class: true },
      });
      expect(result).toEqual({ ...account, profile: student });
    });

    it('should throw NotFoundException if the account does not exist', async () => {
      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update (student)', () => {
    const account = {
      id: 'student-uuid',
      email: 'student@example.com',
      type: AccountsType.Student,
    } as Account;
    const student = {
      id: 'student-uuid',
      first_name: 'John',
      last_name: 'Doe',
    } as Student;

    it('should update the account email and student fields', async () => {
      const mockClass = { id: 2, name: 'Class B' } as Class;
      mockAccountRepository.findOne.mockResolvedValue({ ...account });
      mockManager.findOne.mockImplementation((entity) =>
        entity === Student
          ? Promise.resolve({ ...student })
          : Promise.resolve(mockClass),
      );

      const updateDto: UpdateAccountDto = {
        email: 'new@example.com',
        first_name: 'Johnny',
        classId: 2,
      };

      const result = await service.update('student-uuid', updateDto);

      expect(mockManager.save).toHaveBeenCalled();
      expect(result.email).toEqual('new@example.com');
      expect(result.profile).toMatchObject({
        first_name: 'Johnny',
        last_name: 'Doe',
        class: mockClass,
      });
    });

    it('should throw NotFoundException if the account does not exist', async () => {
      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.update('missing-uuid', {})).rejects.toThrow(
        NotFoundException,
      );
      expect(mockDataSource.transaction).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if the new class does not exist', async () => {
      mockAccountRepository.findOne.mockResolvedValue({ ...account });
      mockManager.findOne.mockImplementation((entity) =>
        entity === Student
          ? Promise.resolve({ ...student })
          : Promise.resolve(null),
      );

      await expect(
        service.update('student-uuid', { classId: 999 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update (teacher)', () => {
    const account = {
      id: 'teacher-uuid',
      email: 'teacher@example.com',
      type: AccountsType.Teacher,
    } as Account;
    const teacher = {
      id: 'teacher-uuid',
      first_name: 'Jane',
      last_name: 'Smith',
      director: undefined,
    } as Teacher;

    it('should attach a new director', async () => {
      const newDirector = { id: 'director-uuid' } as Teacher;
      mockAccountRepository.findOne.mockResolvedValue({ ...account });
      mockManager.findOne.mockImplementation(
        (entity, options: { where: Teacher }) => {
          if (entity === Teacher && options.where.id === 'teacher-uuid') {
            return Promise.resolve({ ...teacher });
          }
          if (entity === Teacher && options.where.id === 'director-uuid') {
            return Promise.resolve(newDirector);
          }
          return Promise.resolve(null);
        },
      );

      const result = await service.update('teacher-uuid', {
        directorId: 'director-uuid',
      });

      expect(mockRelationQueryBuilder.relation).toHaveBeenCalledWith(
        'director',
      );
      expect(mockRelationQueryBuilder.of).toHaveBeenCalledWith('teacher-uuid');
      expect(mockRelationQueryBuilder.set).toHaveBeenCalledWith(
        'director-uuid',
      );
      expect(result.profile).toMatchObject({ director: newDirector });
    });

    it('should clear the director when directorId is null', async () => {
      mockAccountRepository.findOne.mockResolvedValue({ ...account });
      mockManager.findOne.mockResolvedValue({ ...teacher });

      const result = await service.update('teacher-uuid', {
        directorId: null,
      });

      expect(mockRelationQueryBuilder.set).toHaveBeenCalledWith(null);
      expect(result.profile).toMatchObject({ director: undefined });
    });

    it('should throw NotFoundException if the new director does not exist', async () => {
      mockAccountRepository.findOne.mockResolvedValue({ ...account });
      mockManager.findOne.mockImplementation(
        (entity, options: { where: Teacher }) => {
          if (entity === Teacher && options.where.id === 'teacher-uuid') {
            return Promise.resolve({ ...teacher });
          }
          return Promise.resolve(null);
        },
      );

      await expect(
        service.update('teacher-uuid', { directorId: 'missing-uuid' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should merge accounts with their student or teacher profile', async () => {
      const studentAccount = {
        id: 'student-uuid',
        email: 'student@example.com',
        type: AccountsType.Student,
      } as Account;
      const teacherAccount = {
        id: 'teacher-uuid',
        email: 'teacher@example.com',
        type: AccountsType.Teacher,
      } as Account;
      const student = {
        id: 'student-uuid',
        first_name: 'John',
        last_name: 'Doe',
      } as Student;
      const teacher = {
        id: 'teacher-uuid',
        first_name: 'Jane',
        last_name: 'Smith',
      } as Teacher;

      mockAccountRepository.find.mockResolvedValue([
        studentAccount,
        teacherAccount,
      ]);
      mockStudentRepository.find.mockResolvedValue([student]);
      mockTeacherRepository.find.mockResolvedValue([teacher]);

      const result = await service.findAll();

      expect(mockStudentRepository.find).toHaveBeenCalledWith({
        relations: { class: true },
      });
      expect(mockTeacherRepository.find).toHaveBeenCalledWith({
        relations: { director: true },
      });
      expect(result).toEqual([
        { ...studentAccount, profile: student },
        { ...teacherAccount, profile: teacher },
      ]);
    });

    it('should return an empty array if there are no accounts', async () => {
      mockAccountRepository.find.mockResolvedValue([]);
      mockStudentRepository.find.mockResolvedValue([]);
      mockTeacherRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findAll (directorsOnly)', () => {
    it('should only return teacher accounts without a director', async () => {
      const director = {
        id: 'director-uuid',
        first_name: 'Jane',
        last_name: 'Smith',
      } as Teacher;
      const directorAccount = {
        id: 'director-uuid',
        email: 'director@example.com',
        type: AccountsType.Teacher,
      } as Account;

      mockTeacherRepository.find.mockResolvedValue([director]);
      mockAccountRepository.find.mockResolvedValue([directorAccount]);

      const result = await service.findAll({ directorsOnly: true });

      expect(mockTeacherRepository.find).toHaveBeenCalledWith({
        where: { director: IsNull() },
      });
      expect(mockAccountRepository.find).toHaveBeenCalledWith({
        where: { id: In(['director-uuid']) },
      });
      expect(mockStudentRepository.find).not.toHaveBeenCalled();
      expect(result).toEqual([{ ...directorAccount, profile: director }]);
    });

    it('should return an empty array if there are no directors', async () => {
      mockTeacherRepository.find.mockResolvedValue([]);
      mockAccountRepository.find.mockResolvedValue([]);

      const result = await service.findAll({ directorsOnly: true });

      expect(result).toEqual([]);
    });
  });
});
