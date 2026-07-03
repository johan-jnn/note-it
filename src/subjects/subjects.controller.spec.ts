import { Test, TestingModule } from '@nestjs/testing';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';
import { Subject } from './entities/subject.entity';
import { Teacher } from '../accounts/entities/teacher.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { NotFoundException } from '@nestjs/common';

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

const mockSubjectsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('SubjectsController', () => {
  let controller: SubjectsController;
  let service: SubjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubjectsController],
      providers: [
        {
          provide: SubjectsService,
          useValue: mockSubjectsService,
        },
      ],
    }).compile();

    controller = module.get<SubjectsController>(SubjectsController);
    service = module.get<SubjectsService>(SubjectsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new subject', async () => {
      const createDto: CreateSubjectDto = {
        name: 'New Subject',
        description: 'New Description',
        ownerId: 'teacher-uuid',
      };

      mockSubjectsService.create.mockResolvedValue({
        ...mockSubject,
        name: 'New Subject',
        description: 'New Description',
      });

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({
        ...mockSubject,
        name: 'New Subject',
        description: 'New Description',
      });
    });
  });

  describe('findAll', () => {
    it('should return all subjects', async () => {
      mockSubjectsService.findAll.mockResolvedValue(mockSubjects);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockSubjects);
    });
  });

  describe('findOne', () => {
    it('should return a subject by ID', async () => {
      mockSubjectsService.findOne.mockResolvedValue(mockSubject);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockSubject);
    });

    it('should throw NotFoundException if subject not found', async () => {
      mockSubjectsService.findOne.mockRejectedValue(
        new NotFoundException('Subject not found'),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a subject', async () => {
      const updateDto: UpdateSubjectDto = { name: 'Updated Subject' };
      const expectedResult: Subject = {
        ...mockSubject,
        name: 'Updated Subject',
      };

      mockSubjectsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(1, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if subject to update not found', async () => {
      const updateDto: UpdateSubjectDto = { name: 'Updated Subject' };

      mockSubjectsService.update.mockRejectedValue(
        new NotFoundException('Subject not found'),
      );

      await expect(controller.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a subject and return success message', async () => {
      mockSubjectsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        message: 'Subject with ID 1 has been successfully deleted',
      });
    });

    it('should throw NotFoundException if subject to remove not found', async () => {
      mockSubjectsService.remove.mockRejectedValue(
        new NotFoundException('Subject not found'),
      );

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
