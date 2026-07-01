import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { Assignment } from './entities/assignment.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

const mockLesson = { id: 1, name: 'Test Lesson' } as unknown as Lesson;

const mockAssignment = {
  id: 1,
  title: 'Test Assignment',
  begin_date: null,
  end_date: null,
  scale: 20,
  coefficient: 1,
  lesson: mockLesson,
  created_at: new Date(),
  updated_at: new Date(),
} as unknown as Assignment;

const mockAssignments = [
  mockAssignment,
  { ...mockAssignment, id: 2, title: 'Test Assignment 2' },
];

describe('AssignmentsService', () => {
  let service: AssignmentsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };
  const mockLessonRepository = { findOne: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentsService,
        {
          provide: getRepositoryToken(Assignment),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Lesson),
          useValue: mockLessonRepository,
        },
      ],
    }).compile();

    service = module.get<AssignmentsService>(AssignmentsService);

    mockLessonRepository.findOne.mockResolvedValue(mockLesson);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateAssignmentDto = {
      title: 'New Assignment',
      scale: 20,
      lessonId: 1,
    };

    it('should create a new assignment', async () => {
      const expectedResult = {
        id: 1,
        title: 'New Assignment',
        scale: 20,
        lesson: mockLesson,
        created_at: new Date(),
        updated_at: new Date(),
      } as unknown as Assignment;

      mockRepository.create.mockReturnValue(expectedResult);
      mockRepository.save.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(mockLessonRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        title: 'New Assignment',
        scale: 20,
        lesson: mockLesson,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(expectedResult);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if the lesson does not exist', async () => {
      mockLessonRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw an error if creation fails', async () => {
      mockRepository.create.mockReturnValue(mockAssignment);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return all assignments', async () => {
      mockRepository.find.mockResolvedValue(mockAssignments);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: { lesson: true },
      });
      expect(result).toEqual(mockAssignments);
    });

    it('should return an empty array if no assignments exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a assignment by ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockAssignment);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { lesson: true },
      });
      expect(result).toEqual(mockAssignment);
    });

    it('should throw NotFoundException if assignment not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: { lesson: true },
      });
    });
  });

  describe('update', () => {
    it('should update a assignment', async () => {
      const updateDto: UpdateAssignmentDto = { title: 'Updated Assignment' };
      const existingAssignment = { ...mockAssignment };
      const expectedResult = {
        ...existingAssignment,
        title: 'Updated Assignment',
      };

      mockRepository.findOne.mockResolvedValue(existingAssignment);
      mockRepository.save.mockResolvedValue(expectedResult);

      const result = await service.update(1, updateDto);

      expect(mockRepository.save).toHaveBeenCalledWith(expectedResult);
      expect(result).toEqual(expectedResult);
    });

    it('should update the lesson when lessonId is provided', async () => {
      const anotherLesson = {
        id: 2,
        name: 'Another Lesson',
      } as unknown as Lesson;
      mockLessonRepository.findOne.mockResolvedValue(anotherLesson);

      mockRepository.findOne.mockResolvedValue({ ...mockAssignment });
      mockRepository.save.mockImplementation((entity) =>
        Promise.resolve(entity),
      );

      const result = await service.update(1, { lessonId: 2 });

      expect(mockLessonRepository.findOne).toHaveBeenCalledWith({
        where: { id: 2 },
      });
      expect(result.lesson).toEqual(anotherLesson);
    });

    it('should throw NotFoundException if assignment to update not found', async () => {
      const updateDto: UpdateAssignmentDto = { title: 'Updated Assignment' };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a assignment', async () => {
      mockRepository.findOne.mockResolvedValue(mockAssignment);
      mockRepository.remove.mockResolvedValue(mockAssignment);

      await service.remove(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { lesson: true },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockAssignment);
    });

    it('should throw NotFoundException if assignment to remove not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
