import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, NotFoundException } from 'typeorm';
import { GradeService } from './grades.service';
import { Grade } from './entities/grade.entity';
import { CreateGradeDto } from './dto/create-grades.dto';
import { UpdateGradeDto } from './dto/update-grades.dto';

// Mock Grade entity for testing
const mockGrade: Grade = {
  id: 1,
  value: 15,
  max_value: 20,
  created_at: new Date(),
  updated_at: new Date(),
};

const mockGrades: Grade[] = [
  mockGrade,
  {
    id: 2,
    value: 15,
    max_value: 20,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

describe('GradeService', () => {
  let service: GradeService;
  let repository: Repository<Grade>;

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
        GradeService,
        {
          provide: getRepositoryToken(Grade),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<GradeService>(GradeService);
    repository = module.get<Repository<Grade>>(getRepositoryToken(Grade));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new grade', async () => {
      const createDto: CreateGradeDto = { value: number, max_value: number };
      const expectedResult: Grade = {
        id: 1,
        value: 15,
        max_value: 20,
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
      const createDto: CreateGradeDto = { value: number, max_value: number };

      mockRepository.create.mockReturnValue(mockGrade);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return all grades', async () => {
      mockRepository.find.mockResolvedValue(mockGrades);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(mockGrades);
    });

    it('should return an empty array if no grades exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a grade by ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockGrade);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockGrade);
    });

    it('should throw NotFoundException if grade not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });

  describe('update', () => {
    it('should update a grade', async () => {
      const updateDto: UpdateGradeDto = { value: number, max_value: number };
      const expectedResult: Grade = {
        ...mockGrade,
        value: number,
        max_value: number,
      };

      mockRepository.findOne.mockResolvedValue(mockGrade);
      mockRepository.save.mockResolvedValue(expectedResult);

      const result = await service.update(1, updateDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.save).toHaveBeenCalledWith(expectedResult);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if grade to update not found', async () => {
      const updateDto: UpdateGradeDto = { value: number, max_value: number };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a grade', async () => {
      mockRepository.findOne.mockResolvedValue(mockGrade);
      mockRepository.remove.mockResolvedValue(mockGrade);

      await service.remove(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockGrade);
    });

    it('should throw NotFoundException if grade to remove not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
