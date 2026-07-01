import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { AccountsType } from '../common/enums/accountsType.enum';

const mockAccountsService = {
  create: jest.fn(),
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
});
