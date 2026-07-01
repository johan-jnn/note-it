import { Test, TestingModule } from '@nestjs/testing';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { Lesson } from './entities/lesson.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { NotFoundException } from '@nestjs/common';

const mockLesson = {
  id: 1,
  name: 'Test Entity',
  created_at: new Date(),
  updated_at: new Date(),
} as unknown as Lesson;

const mockLessons = [
  mockLesson,
  {
    id: 2,
    name: 'Test Entity 2',
    created_at: new Date(),
    updated_at: new Date(),
  } as unknown as Lesson,
];

const mockLessonService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('LessonsController', () => {
  let controller: LessonsController;
  let service: LessonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonsController],
      providers: [
        {
          provide: LessonsService,
          useValue: mockLessonService,
        },
      ],
    }).compile();

    controller = module.get<LessonsController>(LessonsController);
    service = module.get<LessonsService>(LessonsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new lesson', async () => {
      const createDto: CreateLessonDto = {
        name: 'New Lesson',
        classId: 1,
        teacherId: 'teacher-uuid',
        subjectId: 1,
      };

      mockLessonService.create.mockResolvedValue({
        ...mockLesson,
        name: 'New Lesson',
      });

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({
        ...mockLesson,
        name: 'New Lesson',
      });
    });
  });

  describe('findAll', () => {
    it('should return all lessons', async () => {
      mockLessonService.findAll.mockResolvedValue(mockLessons);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockLessons);
    });
  });

  describe('findOne', () => {
    it('should return a lesson by ID', async () => {
      mockLessonService.findOne.mockResolvedValue(mockLesson);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockLesson);
    });

    it('should throw NotFoundException if lesson not found', async () => {
      mockLessonService.findOne.mockRejectedValue(
        new NotFoundException('Lesson not found'),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a lesson', async () => {
      const updateDto: UpdateLessonDto = { name: 'Updated Lesson' };
      const expectedResult = {
        ...mockLesson,
        name: 'Updated Lesson',
      } as unknown as Lesson;

      mockLessonService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(1, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if lesson to update not found', async () => {
      const updateDto: UpdateLessonDto = { name: 'Updated Lesson' };

      mockLessonService.update.mockRejectedValue(
        new NotFoundException('Lesson not found'),
      );

      await expect(controller.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a lesson and return success message', async () => {
      mockLessonService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        message: 'Lesson with ID 1 has been successfully deleted',
      });
    });

    it('should throw NotFoundException if lesson to remove not found', async () => {
      mockLessonService.remove.mockRejectedValue(
        new NotFoundException('Lesson not found'),
      );

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
