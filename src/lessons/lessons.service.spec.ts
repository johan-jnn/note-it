import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { Lesson } from './entities/lesson.entity';
import { Class } from '../classes/entities/class.entity';
import { Teacher } from '../accounts/entities/teacher.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

const mockClass = { id: 1, name: 'Class A' } as Class;
const mockTeacher = {
  id: 'teacher-uuid',
  first_name: 'Jane',
  last_name: 'Doe',
} as Teacher;
const mockSubject = { id: 1, name: 'Math' } as Subject;

const mockLesson = {
  id: 1,
  name: 'Test Lesson',
  class: mockClass,
  teacher: mockTeacher,
  subject: mockSubject,
  created_at: new Date(),
  updated_at: new Date(),
} as unknown as Lesson;

const mockLessons = [
  mockLesson,
  { ...mockLesson, id: 2, name: 'Test Lesson 2' } as unknown as Lesson,
];

describe('LessonsService', () => {
  let service: LessonsService;

  const mockLessonRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };
  const mockClassRepository = { findOne: jest.fn() };
  const mockTeacherRepository = { findOne: jest.fn() };
  const mockSubjectRepository = { findOne: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonsService,
        {
          provide: getRepositoryToken(Lesson),
          useValue: mockLessonRepository,
        },
        { provide: getRepositoryToken(Class), useValue: mockClassRepository },
        {
          provide: getRepositoryToken(Teacher),
          useValue: mockTeacherRepository,
        },
        {
          provide: getRepositoryToken(Subject),
          useValue: mockSubjectRepository,
        },
      ],
    }).compile();

    service = module.get<LessonsService>(LessonsService);

    mockClassRepository.findOne.mockResolvedValue(mockClass);
    mockTeacherRepository.findOne.mockResolvedValue(mockTeacher);
    mockSubjectRepository.findOne.mockResolvedValue(mockSubject);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateLessonDto = {
      name: 'New Lesson',
      classId: 1,
      teacherId: 'teacher-uuid',
      subjectId: 1,
    };

    it('should create a new lesson', async () => {
      const expectedResult = { ...mockLesson, name: 'New Lesson' };

      mockLessonRepository.create.mockReturnValue(expectedResult);
      mockLessonRepository.save.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(mockClassRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockTeacherRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'teacher-uuid' },
      });
      expect(mockSubjectRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockLessonRepository.create).toHaveBeenCalledWith({
        name: 'New Lesson',
        class: mockClass,
        teacher: mockTeacher,
        subject: mockSubject,
      });
      expect(mockLessonRepository.save).toHaveBeenCalledWith(expectedResult);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if the class does not exist', async () => {
      mockClassRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if the teacher does not exist', async () => {
      mockTeacherRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if the subject does not exist', async () => {
      mockSubjectRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw an error if creation fails', async () => {
      mockLessonRepository.create.mockReturnValue(mockLesson);
      mockLessonRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('findAll', () => {
    it('should return all lessons', async () => {
      mockLessonRepository.find.mockResolvedValue(mockLessons);

      const result = await service.findAll();

      expect(mockLessonRepository.find).toHaveBeenCalledWith({
        relations: { class: true, teacher: true, subject: true },
      });
      expect(result).toEqual(mockLessons);
    });

    it('should return an empty array if no lessons exist', async () => {
      mockLessonRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a lesson by ID', async () => {
      mockLessonRepository.findOne.mockResolvedValue(mockLesson);

      const result = await service.findOne(1);

      expect(mockLessonRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { class: true, teacher: true, subject: true },
      });
      expect(result).toEqual(mockLesson);
    });

    it('should throw NotFoundException if lesson not found', async () => {
      mockLessonRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a lesson', async () => {
      const updateDto: UpdateLessonDto = { name: 'Updated Lesson' };
      const existingLesson = { ...mockLesson };
      const expectedResult = { ...existingLesson, name: 'Updated Lesson' };

      mockLessonRepository.findOne.mockResolvedValue(existingLesson);
      mockLessonRepository.save.mockResolvedValue(expectedResult);

      const result = await service.update(1, updateDto);

      expect(mockLessonRepository.save).toHaveBeenCalledWith(expectedResult);
      expect(result).toEqual(expectedResult);
    });

    it('should update the class when classId is provided', async () => {
      const anotherClass = { id: 2, name: 'Class B' } as Class;
      mockClassRepository.findOne.mockResolvedValue(anotherClass);

      const existingLesson = { ...mockLesson };
      mockLessonRepository.findOne.mockResolvedValue(existingLesson);
      mockLessonRepository.save.mockImplementation((entity) =>
        Promise.resolve(entity),
      );

      const result = await service.update(1, { classId: 2 });

      expect(mockClassRepository.findOne).toHaveBeenCalledWith({
        where: { id: 2 },
      });
      expect(result.class).toEqual(anotherClass);
    });

    it('should throw NotFoundException if lesson to update not found', async () => {
      const updateDto: UpdateLessonDto = { name: 'Updated Lesson' };

      mockLessonRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a lesson', async () => {
      mockLessonRepository.findOne.mockResolvedValue(mockLesson);
      mockLessonRepository.remove.mockResolvedValue(mockLesson);

      await service.remove(1);

      expect(mockLessonRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { class: true, teacher: true, subject: true },
      });
      expect(mockLessonRepository.remove).toHaveBeenCalledWith(mockLesson);
    });

    it('should throw NotFoundException if lesson to remove not found', async () => {
      mockLessonRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
