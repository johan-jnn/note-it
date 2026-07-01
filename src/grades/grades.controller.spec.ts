import { Test, TestingModule } from '@nestjs/testing';
import { GradesController } from './grades.controller';
import { GradesService } from './grades.service';
import { Grade } from './entities/grade.entity';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { NotFoundException } from '@nestjs/common';

const mockGrade = {
  id: 1,
  value: 15,
  comment: 'Good work',
  created_at: new Date(),
  updated_at: new Date(),
} as unknown as Grade;

const mockGrades = [
  mockGrade,
  {
    id: 2,
    value: 12,
    comment: 'Average',
    created_at: new Date(),
    updated_at: new Date(),
  } as unknown as Grade,
];

const mockGradeService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('GradesController', () => {
  let controller: GradesController;
  let service: GradesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GradesController],
      providers: [
        {
          provide: GradesService,
          useValue: mockGradeService,
        },
      ],
    }).compile();

    controller = module.get<GradesController>(GradesController);
    service = module.get<GradesService>(GradesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new grade', async () => {
      const createDto: CreateGradeDto = {
        value: 15,
        assignmentId: 1,
        studentId: 'student-uuid',
      };

      mockGradeService.create.mockResolvedValue({
        ...mockGrade,
        value: 15,
      });

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({
        ...mockGrade,
        value: 15,
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
      const updateDto: UpdateGradeDto = { value: 18 };
      const expectedResult = {
        ...mockGrade,
        value: 18,
      };

      mockGradeService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(1, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if grade to update not found', async () => {
      const updateDto: UpdateGradeDto = { value: 18 };

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
