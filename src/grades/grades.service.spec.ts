import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { GradesService } from './grades.service';
import { Grade } from './entities/grade.entity';
import { Assignment } from '../assignments/entities/assignment.entity';
import { Student } from '../accounts/entities/student.entity';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';

const mockAssignment = {
  id: 1,
  title: 'Test Assignment',
} as unknown as Assignment;
const mockStudent = {
  id: 'student-uuid',
  first_name: 'John',
  last_name: 'Doe',
} as unknown as Student;

const mockGrade = {
  id: 1,
  value: 15,
  comment: 'Good work',
  assignment: mockAssignment,
  student: mockStudent,
  created_at: new Date(),
  updated_at: new Date(),
} as unknown as Grade;

const mockGrades = [
  mockGrade,
  { ...mockGrade, id: 2, value: 12, comment: 'Average' } as unknown as Grade,
];

describe('GradesService', () => {
  let service: GradesService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };
  const mockAssignmentRepository = { findOne: jest.fn() };
  const mockStudentRepository = { findOne: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GradesService,
        {
          provide: getRepositoryToken(Grade),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Assignment),
          useValue: mockAssignmentRepository,
        },
        {
          provide: getRepositoryToken(Student),
          useValue: mockStudentRepository,
        },
      ],
    }).compile();

    service = module.get<GradesService>(GradesService);

    mockAssignmentRepository.findOne.mockResolvedValue(mockAssignment);
    mockStudentRepository.findOne.mockResolvedValue(mockStudent);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateGradeDto = {
      value: 15,
      assignmentId: 1,
      studentId: 'student-uuid',
    };

    it('should create a new grade', async () => {
      const expectedResult = {
        id: 1,
        value: 15,
        assignment: mockAssignment,
        student: mockStudent,
        created_at: new Date(),
        updated_at: new Date(),
      } as unknown as Grade;

      mockRepository.create.mockReturnValue(expectedResult);
      mockRepository.save.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(mockAssignmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockStudentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'student-uuid' },
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        value: 15,
        assignment: mockAssignment,
        student: mockStudent,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(expectedResult);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if the assignment does not exist', async () => {
      mockAssignmentRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if the student does not exist', async () => {
      mockStudentRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw an error if creation fails', async () => {
      mockRepository.create.mockReturnValue(mockGrade);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return all grades', async () => {
      mockRepository.find.mockResolvedValue(mockGrades);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: { assignment: true, student: true },
      });
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

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { assignment: true, student: true },
      });
      expect(result).toEqual(mockGrade);
    });

    it('should throw NotFoundException if grade not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: { assignment: true, student: true },
      });
    });
  });

  describe('update', () => {
    it('should update a grade', async () => {
      const updateDto: UpdateGradeDto = { value: 18 };
      const existingGrade = { ...mockGrade };
      const expectedResult = {
        ...existingGrade,
        value: 18,
      };

      mockRepository.findOne.mockResolvedValue(existingGrade);
      mockRepository.save.mockResolvedValue(expectedResult);

      const result = await service.update(1, updateDto);

      expect(mockRepository.save).toHaveBeenCalledWith(expectedResult);
      expect(result).toEqual(expectedResult);
    });

    it('should update the assignment/student when ids are provided', async () => {
      const anotherAssignment = {
        id: 2,
        title: 'Another Assignment',
      } as unknown as Assignment;
      mockAssignmentRepository.findOne.mockResolvedValue(anotherAssignment);

      mockRepository.findOne.mockResolvedValue({ ...mockGrade });
      mockRepository.save.mockImplementation((entity) =>
        Promise.resolve(entity),
      );

      const result = await service.update(1, { assignmentId: 2 });

      expect(mockAssignmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 2 },
      });
      expect(result.assignment).toEqual(anotherAssignment);
    });

    it('should throw NotFoundException if grade to update not found', async () => {
      const updateDto: UpdateGradeDto = { value: 18 };

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

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { assignment: true, student: true },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockGrade);
    });

    it('should throw NotFoundException if grade to remove not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
