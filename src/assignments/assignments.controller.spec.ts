import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { NotFoundException } from '@nestjs/common';

const mockAssignment = {
  id: 1,
  title: 'Test Assignment',
  begin_date: null,
  end_date: null,
  scale: 20,
  coefficient: 1,
  created_at: new Date(),
  updated_at: new Date(),
} as unknown as Assignment;

const mockAssignments = [
  mockAssignment,
  {
    id: 2,
    title: 'Test Assignment 2',
    begin_date: null,
    end_date: null,
    scale: 20,
    coefficient: 1,
    created_at: new Date(),
    updated_at: new Date(),
  } as unknown as Assignment,
];

const mockAssignmentService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('AssignmentsController', () => {
  let controller: AssignmentsController;
  let service: AssignmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssignmentsController],
      providers: [
        {
          provide: AssignmentsService,
          useValue: mockAssignmentService,
        },
      ],
    }).compile();

    controller = module.get<AssignmentsController>(AssignmentsController);
    service = module.get<AssignmentsService>(AssignmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new assignment', async () => {
      const createDto: CreateAssignmentDto = {
        title: 'New Assignment',
        scale: 20,
        lessonId: 1,
      };

      mockAssignmentService.create.mockResolvedValue({
        ...mockAssignment,
        title: 'New Assignment',
      });

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({
        ...mockAssignment,
        title: 'New Assignment',
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
      const updateDto: UpdateAssignmentDto = { title: 'Updated Assignment' };
      const expectedResult = {
        ...mockAssignment,
        title: 'Updated Assignment',
      };

      mockAssignmentService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(1, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if assignment to update not found', async () => {
      const updateDto: UpdateAssignmentDto = { title: 'Updated Assignment' };

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
