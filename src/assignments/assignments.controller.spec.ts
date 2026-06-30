import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentController } from './assignments.controller';
import { AssignmentService } from './assignments.service';
import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentDto } from './dto/create-assignments.dto';
import { UpdateAssignmentDto } from './dto/update-assignments.dto';
import { NotFoundException } from '@nestjs/common';

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

const mockAssignmentService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('AssignmentController', () => {
  let controller: AssignmentController;
  let service: AssignmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssignmentController],
      providers: [
        {
          provide: AssignmentService,
          useValue: mockAssignmentService,
        },
      ],
    }).compile();

    controller = module.get<AssignmentController>(AssignmentController);
    service = module.get<AssignmentService>(AssignmentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new assignment', async () => {
      const createDto: CreateAssignmentDto = { description: string };

      mockAssignmentService.create.mockResolvedValue({
        ...mockAssignment,
        description: string,
      });

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({
        ...mockAssignment,
        description: string,
      });
    });
  });

  describe('findAll', () => {
    it('should return all assignments', async () => {
      mockAssignmentService.findAll.mockResolvedValue(mockAssignments);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockAssignments);
    });
  });

  describe('findOne', () => {
    it('should return a assignment by ID', async () => {
      mockAssignmentService.findOne.mockResolvedValue(mockAssignment);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockAssignment);
    });

    it('should throw NotFoundException if assignment not found', async () => {
      mockAssignmentService.findOne.mockRejectedValue(
        new NotFoundException('Assignment not found'),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a assignment', async () => {
      const updateDto: UpdateAssignmentDto = { description: string };
      const expectedResult: Assignment = {
        ...mockAssignment,
        description: string,
      };

      mockAssignmentService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(1, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if assignment to update not found', async () => {
      const updateDto: UpdateAssignmentDto = { description: string };

      mockAssignmentService.update.mockRejectedValue(
        new NotFoundException('Assignment not found'),
      );

      await expect(controller.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a assignment and return success message', async () => {
      mockAssignmentService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        message: 'Assignment with ID 1 has been successfully deleted',
      });
    });

    it('should throw NotFoundException if assignment to remove not found', async () => {
      mockAssignmentService.remove.mockRejectedValue(
        new NotFoundException('Assignment not found'),
      );

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
