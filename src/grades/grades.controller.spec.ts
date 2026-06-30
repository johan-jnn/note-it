import { Test, TestingModule } from '@nestjs/testing';
import { GradeController } from './grades.controller';
import { GradeService } from './grades.service';
import { Grade } from './entities/grade.entity';
import { CreateGradeDto } from './dto/create-grades.dto';
import { UpdateGradeDto } from './dto/update-grades.dto';
import { NotFoundException } from '@nestjs/common';

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

const mockGradeService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('GradeController', () => {
  let controller: GradeController;
  let service: GradeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GradeController],
      providers: [
        {
          provide: GradeService,
          useValue: mockGradeService,
        },
      ],
    }).compile();

    controller = module.get<GradeController>(GradeController);
    service = module.get<GradeService>(GradeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new grade', async () => {
      const createDto: CreateGradeDto = { value: number, max_value: number };

      mockGradeService.create.mockResolvedValue({
        ...mockGrade,
        value: number,
        max_value: number,
      });

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({
        ...mockGrade,
        value: number,
        max_value: number,
      });
    });
  });

  describe('findAll', () => {
    it('should return all grades', async () => {
      mockGradeService.findAll.mockResolvedValue(mockGrades);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockGrades);
    });
  });

  describe('findOne', () => {
    it('should return a grade by ID', async () => {
      mockGradeService.findOne.mockResolvedValue(mockGrade);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockGrade);
    });

    it('should throw NotFoundException if grade not found', async () => {
      mockGradeService.findOne.mockRejectedValue(
        new NotFoundException('Grade not found'),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
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

      mockGradeService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(1, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if grade to update not found', async () => {
      const updateDto: UpdateGradeDto = { value: number, max_value: number };

      mockGradeService.update.mockRejectedValue(
        new NotFoundException('Grade not found'),
      );

      await expect(controller.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a grade and return success message', async () => {
      mockGradeService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        message: 'Grade with ID 1 has been successfully deleted',
      });
    });

    it('should throw NotFoundException if grade to remove not found', async () => {
      mockGradeService.remove.mockRejectedValue(
        new NotFoundException('Grade not found'),
      );

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
