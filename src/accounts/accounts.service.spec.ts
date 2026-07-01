import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { Class } from '../classes/entities/class.entity';
import { Teacher } from './entities/teacher.entity';
import { Account } from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { AccountsType } from '../common/enums/accountsType.enum';

describe('AccountsService', () => {
  let service: AccountsService;

  const mockClassRepository = {
    findOne: jest.fn(),
  };
  const mockTeacherRepository = {
    findOne: jest.fn(),
  };
  const mockManager = {
    create: jest.fn((entity, data) =>
      entity === Account ? { id: 'new-account-uuid', ...data } : { ...data },
    ),
    save: jest.fn((data) => Promise.resolve(data)),
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
});
