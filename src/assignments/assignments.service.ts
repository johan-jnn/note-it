import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { Assignment } from './entities/assignment.entity';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
  ) {}

  async create(createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    const newAssignment = this.assignmentRepository.create(createAssignmentDto);
    return await this.assignmentRepository.save(newAssignment);
  }

  async findAll(): Promise<Assignment[]> {
    return await this.assignmentRepository.find();
  }

  async findOne(id: number): Promise<Assignment> {
    const foundAssignment = await this.assignmentRepository.findOne({
      where: { id },
    });
    if (!foundAssignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }
    return foundAssignment;
  }

  async update(
    id: number,
    updateAssignmentDto: UpdateAssignmentDto,
  ): Promise<Assignment> {
    const existingAssignment = await this.findOne(id);
    Object.assign(existingAssignment, updateAssignmentDto);
    return await this.assignmentRepository.save(existingAssignment);
  }

  async remove(id: number): Promise<void> {
    const existingAssignment = await this.findOne(id);
    await this.assignmentRepository.remove(existingAssignment);
  }
}
