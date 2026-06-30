import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, NotFoundException } from 'typeorm';
import { AssignmentService } from './assignments.service';
import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentDto } from './dto/create-assignments.dto';
import { UpdateAssignmentDto } from './dto/update-assignments.dto';

// Mock Assignment entity for testing
const mockAssignment: Assignment = {
  id: 1,
  description: 'Test Description',
  created_at: new Date(),
  updated_at: new Date(),
};

const mockAssignments: Assignment[] = [
  mockAssignment,
  {
    id: 2,
    description: 'Test Description',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

describe('AssignmentService', () => {
  let service: AssignmentService;
  let repository: Repository<Assignment>;

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
        AssignmentService,
        {
          provide: getRepositoryToken(Assignment),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AssignmentService>(AssignmentService);
    repository = module.get<Repository<Assignment>>(
      getRepositoryToken(Assignment),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new assignment', async () => {
      const createDto: CreateAssignmentDto = { description: string };
      const expectedResult: Assignment = {
        id: 1,
        description: 'Test Description',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockRepository.create.mockReturnValue(expectedResult);
      mockRepository.save.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(expectedResult);
      expect(result).toEqual(expectedResult);
    });

    it('should throw an error if creation fails', async () => {
      const createDto: CreateAssignmentDto = { description: string };

      mockRepository.create.mockReturnValue(mockAssignment);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return all assignments', async () => {
      mockRepository.find.mockResolvedValue(mockAssignments);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
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

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockAssignment);
    });

    it('should throw NotFoundException if assignment not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });

  describe('update', () => {
    it('should update a assignment', async () => {
      const updateDto: UpdateAssignmentDto = { description: string };
      const expectedResult: Assignment = {
        ...mockAssignment,
        description: string,
      };

      mockRepository.findOne.mockResolvedValue(mockAssignment);
      mockRepository.save.mockResolvedValue(expectedResult);

      const result = await service.update(1, updateDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.save).toHaveBeenCalledWith(expectedResult);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if assignment to update not found', async () => {
      const updateDto: UpdateAssignmentDto = { description: string };

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

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockAssignment);
    });

    it('should throw NotFoundException if assignment to remove not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
