import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { Subject } from './entities/subject.entity';
import { Teacher } from '../accounts/entities/teacher.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

const mockTeacher = {
  id: 'teacher-uuid',
  first_name: 'Jane',
  last_name: 'Doe',
} as Teacher;

// Mock Subject entity for testing
const mockSubject: Subject = {
  id: 1,
  name: 'Test Subject',
  description: 'Test Description',
  created_at: new Date(),
  updated_at: new Date(),
  owner: mockTeacher,
};

const mockSubjects: Subject[] = [
  mockSubject,
  {
    id: 2,
    name: 'Another Subject',
    description: 'Another Description',
    created_at: new Date(),
    updated_at: new Date(),
    owner: mockTeacher,
  },
];

describe('SubjectsService', () => {
  let service: SubjectsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };
  const mockTeacherRepository = { findOne: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectsService,
        {
          provide: getRepositoryToken(Subject),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Teacher),
          useValue: mockTeacherRepository,
        },
      ],
    }).compile();

    service = module.get<SubjectsService>(SubjectsService);

    mockTeacherRepository.findOne.mockResolvedValue(mockTeacher);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateSubjectDto = {
      name: 'New Subject',
      description: 'New Description',
      ownerId: 'teacher-uuid',
    };

    it('should create a new subject', async () => {
      const expectedResult: Subject = {
        id: 1,
        name: 'New Subject',
        description: 'New Description',
        created_at: new Date(),
        updated_at: new Date(),
        owner: mockTeacher,
      };

      mockRepository.create.mockReturnValue(expectedResult);
      mockRepository.save.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(mockTeacherRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'teacher-uuid' },
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        name: 'New Subject',
        description: 'New Description',
        owner: mockTeacher,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(expectedResult);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if the owner does not exist', async () => {
      mockTeacherRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw an error if creation fails', async () => {
      mockRepository.create.mockReturnValue(mockSubject);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('findAll', () => {
    it('should return all subjects', async () => {
      mockRepository.find.mockResolvedValue(mockSubjects);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: { owner: true },
      });
      expect(result).toEqual(mockSubjects);
    });

    it('should return an empty array if no subjects exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a subject by ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockSubject);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { owner: true },
      });
      expect(result).toEqual(mockSubject);
    });

    it('should throw NotFoundException if subject not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a subject', async () => {
      const updateDto: UpdateSubjectDto = { name: 'Updated Subject' };
      const expectedResult: Subject = {
        ...mockSubject,
        name: 'Updated Subject',
      };

      mockRepository.findOne.mockResolvedValue(mockSubject);
      mockRepository.save.mockResolvedValue(expectedResult);

      const result = await service.update(1, updateDto);

      expect(mockRepository.save).toHaveBeenCalledWith(expectedResult);
      expect(result).toEqual(expectedResult);
    });

    it('should update the owner when ownerId is provided', async () => {
      const anotherTeacher = {
        id: 'another-uuid',
        first_name: 'John',
        last_name: 'Smith',
      } as Teacher;
      mockTeacherRepository.findOne.mockResolvedValue(anotherTeacher);

      mockRepository.findOne.mockResolvedValue({ ...mockSubject });
      mockRepository.save.mockImplementation((entity) =>
        Promise.resolve(entity),
      );

      const result = await service.update(1, { ownerId: 'another-uuid' });

      expect(mockTeacherRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'another-uuid' },
      });
      expect(result.owner).toEqual(anotherTeacher);
    });

    it('should throw NotFoundException if subject to update not found', async () => {
      const updateDto: UpdateSubjectDto = { name: 'Updated Subject' };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a subject', async () => {
      mockRepository.findOne.mockResolvedValue(mockSubject);
      mockRepository.remove.mockResolvedValue(mockSubject);

      await service.remove(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { owner: true },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockSubject);
    });

    it('should throw NotFoundException if subject to remove not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
