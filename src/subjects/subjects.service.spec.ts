import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, NotFoundException } from 'typeorm';
import { SubjectsService } from './subjects.service';
import { Subject } from './entities/subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

// Mock Subject entity for testing
const mockSubject: Subject = {
  id: 1,
  name: 'Test Subject',
  description: 'Test Description',
  created_at: new Date(),
  updated_at: new Date(),
  owner: null,
};

const mockSubjects: Subject[] = [
  mockSubject,
  {
    id: 2,
    name: 'Another Subject',
    description: 'Another Description',
    created_at: new Date(),
    updated_at: new Date(),
    owner: null,
  },
];

describe('SubjectsService', () => {
  let service: SubjectsService;
  let repository: Repository<Subject>;

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
        SubjectsService,
        {
          provide: getRepositoryToken(Subject),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SubjectsService>(SubjectsService);
    repository = module.get<Repository<Subject>>(getRepositoryToken(Subject));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new subject', async () => {
      const createDto: CreateSubjectDto = {
        name: 'New Subject',
        description: 'New Description',
      };
      const expectedResult: Subject = {
        id: 1,
        name: 'New Subject',
        description: 'New Description',
        created_at: new Date(),
        updated_at: new Date(),
        owner: null,
      };

      mockRepository.create.mockReturnValue(expectedResult);
      mockRepository.save.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(expectedResult);
      expect(result).toEqual(expectedResult);
    });

    it('should throw an error if creation fails', async () => {
      const createDto: CreateSubjectDto = { name: 'New Subject' };

      mockRepository.create.mockReturnValue(mockSubject);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return all subjects', async () => {
      mockRepository.find.mockResolvedValue(mockSubjects);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
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

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockSubject);
    });

    it('should throw NotFoundException if subject not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
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

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.save).toHaveBeenCalledWith(expectedResult);
      expect(result).toEqual(expectedResult);
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

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockSubject);
    });

    it('should throw NotFoundException if subject to remove not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
