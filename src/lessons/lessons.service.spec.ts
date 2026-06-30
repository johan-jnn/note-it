import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { Lesson } from './entities/lesson.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

const mockLesson = {
  id: 1,
  name: 'Test Lesson',
  created_at: new Date(),
  updated_at: new Date(),
} as unknown as Lesson;

const mockLessons = [
  mockLesson,
  {
    id: 2,
    name: 'Test Lesson 2',
    created_at: new Date(),
    updated_at: new Date(),
  } as unknown as Lesson,
];

describe('LessonsService', () => {
  let service: LessonsService;

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
        LessonsService,
        {
          provide: getRepositoryToken(Lesson),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<LessonsService>(LessonsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new lesson', async () => {
      const createDto: CreateLessonDto = { name: 'New Lesson' };
      const expectedResult = {
        id: 1,
        name: 'New Lesson',
        created_at: new Date(),
        updated_at: new Date(),
      } as unknown as Lesson;

      mockRepository.create.mockReturnValue(expectedResult);
      mockRepository.save.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(expectedResult);
      expect(result).toEqual(expectedResult);
    });

    it('should throw an error if creation fails', async () => {
      const createDto: CreateLessonDto = { name: 'New Lesson' };

      mockRepository.create.mockReturnValue(mockLesson);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return all lessons', async () => {
      mockRepository.find.mockResolvedValue(mockLessons);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(mockLessons);
    });

    it('should return an empty array if no lessons exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a lesson by ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockLesson);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockLesson);
    });

    it('should throw NotFoundException if lesson not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });

  describe('update', () => {
    it('should update a lesson', async () => {
      const updateDto: UpdateLessonDto = { name: 'Updated Lesson' };
      const existingLesson = { ...mockLesson } as unknown as Lesson;
      const expectedResult = {
        ...existingLesson,
        name: 'Updated Lesson',
      } as unknown as Lesson;

      mockRepository.findOne.mockResolvedValue(existingLesson);
      mockRepository.save.mockResolvedValue(expectedResult);

      const result = await service.update(1, updateDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.save).toHaveBeenCalledWith(expectedResult);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if lesson to update not found', async () => {
      const updateDto: UpdateLessonDto = { name: 'Updated Lesson' };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a lesson', async () => {
      mockRepository.findOne.mockResolvedValue(mockLesson);
      mockRepository.remove.mockResolvedValue(mockLesson);

      await service.remove(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockLesson);
    });

    it('should throw NotFoundException if lesson to remove not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
