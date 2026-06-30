import { Test, TestingModule } from '@nestjs/testing';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { Class } from './entities/class.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { NotFoundException } from '@nestjs/common';

// Mock Class entity for testing
const mockClass: Class = {
  id: 1,
  name: 'Test Class',
  created_at: new Date(),
  updated_at: new Date(),
};

const mockClasses: Class[] = [
  mockClass,
  {
    id: 2,
    name: 'Another Class',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

const mockClassesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ClassesController', () => {
  let controller: ClassesController;
  let service: ClassesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassesController],
      providers: [
        {
          provide: ClassesService,
          useValue: mockClassesService,
        },
      ],
    }).compile();

    controller = module.get<ClassesController>(ClassesController);
    service = module.get<ClassesService>(ClassesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new class', async () => {
      const createDto: CreateClassDto = { name: 'New Class' };

      mockClassesService.create.mockResolvedValue({
        ...mockClass,
        name: 'New Class',
      });

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({
        ...mockClass,
        name: 'New Class',
      });
    });
  });

  describe('findAll', () => {
    it('should return all classes', async () => {
      mockClassesService.findAll.mockResolvedValue(mockClasses);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockClasses);
    });
  });

  describe('findOne', () => {
    it('should return a class by ID', async () => {
      mockClassesService.findOne.mockResolvedValue(mockClass);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockClass);
    });

    it('should throw NotFoundException if class not found', async () => {
      mockClassesService.findOne.mockRejectedValue(
        new NotFoundException('Class not found'),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a class', async () => {
      const updateDto: UpdateClassDto = { name: 'Updated Class' };
      const expectedResult: Class = {
        ...mockClass,
        name: 'Updated Class',
      };

      mockClassesService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(1, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if class to update not found', async () => {
      const updateDto: UpdateClassDto = { name: 'Updated Class' };

      mockClassesService.update.mockRejectedValue(
        new NotFoundException('Class not found'),
      );

      await expect(controller.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a class and return success message', async () => {
      mockClassesService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        message: 'Class with ID 1 has been successfully deleted',
      });
    });

    it('should throw NotFoundException if class to remove not found', async () => {
      mockClassesService.remove.mockRejectedValue(
        new NotFoundException('Class not found'),
      );

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
