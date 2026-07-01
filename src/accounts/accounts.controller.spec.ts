import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { NotFoundException } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountsType } from '../common/enums/accountsType.enum';

const mockAccountsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
};

describe('AccountsController', () => {
  let controller: AccountsController;
  let service: typeof mockAccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [
        {
          provide: AccountsService,
          useValue: mockAccountsService,
        },
      ],
    }).compile();

    controller = module.get<AccountsController>(AccountsController);
    service = module.get(AccountsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate to the service and return its result', async () => {
      const createDto: CreateAccountDto = {
        email: 'student@example.com',
        type: AccountsType.Student,
        first_name: 'John',
        last_name: 'Doe',
        classId: 1,
      };
      const expectedResult = {
        id: 'uuid',
        email: createDto.email,
        type: createDto.type,
        created_at: new Date(),
        updated_at: new Date(),
        profile: { id: 'uuid', first_name: 'John', last_name: 'Doe' },
      };

      service.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should delegate to the service and return its result', async () => {
      const expectedResult = [
        {
          id: 'uuid',
          email: 'student@example.com',
          type: AccountsType.Student,
          created_at: new Date(),
          updated_at: new Date(),
          profile: { id: 'uuid', first_name: 'John', last_name: 'Doe' },
        },
      ];

      service.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith({ directorsOnly: false });
      expect(result).toEqual(expectedResult);
    });

    it('should forward directorsOnly=true to the service', async () => {
      service.findAll.mockResolvedValue([]);

      await controller.findAll('true');

      expect(service.findAll).toHaveBeenCalledWith({ directorsOnly: true });
    });
  });

  describe('findOne', () => {
    it('should delegate to the service and return its result', async () => {
      const expectedResult = {
        id: 'uuid',
        email: 'student@example.com',
        type: AccountsType.Student,
        created_at: new Date(),
        updated_at: new Date(),
        profile: { id: 'uuid', first_name: 'John', last_name: 'Doe' },
      };

      service.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne('uuid');

      expect(service.findOne).toHaveBeenCalledWith('uuid');
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if the account does not exist', async () => {
      service.findOne.mockRejectedValue(new NotFoundException('Account not found'));

      await expect(controller.findOne('missing-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should delegate to the service and return its result', async () => {
      const updateDto: UpdateAccountDto = { first_name: 'Johnny' };
      const expectedResult = {
        id: 'uuid',
        email: 'student@example.com',
        type: AccountsType.Student,
        created_at: new Date(),
        updated_at: new Date(),
        profile: { id: 'uuid', first_name: 'Johnny', last_name: 'Doe' },
      };

      service.update.mockResolvedValue(expectedResult);

      const result = await controller.update('uuid', updateDto);

      expect(service.update).toHaveBeenCalledWith('uuid', updateDto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if the account does not exist', async () => {
      service.update.mockRejectedValue(new NotFoundException('Account not found'));

      await expect(
        controller.update('missing-uuid', { first_name: 'Johnny' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
