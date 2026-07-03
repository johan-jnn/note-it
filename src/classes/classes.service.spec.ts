import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { Class } from './entities/class.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

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

describe('ClassesService', () => {
  let service: ClassesService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesService,
        {
          provide: getRepositoryToken(Class),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new class', async () => {
      const createDto: CreateClassDto = { name: 'New Class' };
      const expectedResult: Class = {
        id: 1,
        name: 'New Class',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockRepository.create.mockReturnValue(expectedResult);
      mockRepository.save.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(expectedResult);
      expect(result).toEqual(expectedResult);
    });

    it('should throw an error if creation fails', async () => {
      const createDto: CreateClassDto = { name: 'New Class' };

      mockRepository.create.mockReturnValue(mockClass);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return all classes', async () => {
      mockRepository.find.mockResolvedValue(mockClasses);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(mockClasses);
    });

    it('should return an empty array if no classes exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a class by ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockClass);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockClass);
    });

    it('should throw NotFoundException if class not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });

  describe('update', () => {
    it('should update a class', async () => {
      const updateDto: UpdateClassDto = { name: 'Updated Class' };
      const expectedResult: Class = {
        ...mockClass,
        name: 'Updated Class',
      };

      mockRepository.findOne.mockResolvedValue(mockClass);
      mockRepository.save.mockResolvedValue(expectedResult);

      const result = await service.update(1, updateDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.save).toHaveBeenCalledWith(expectedResult);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if class to update not found', async () => {
      const updateDto: UpdateClassDto = { name: 'Updated Class' };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a class', async () => {
      mockRepository.findOne.mockResolvedValue(mockClass);
      mockRepository.remove.mockResolvedValue(mockClass);

      await service.remove(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockClass);
    });

    it('should throw NotFoundException if class to remove not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
