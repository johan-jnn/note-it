import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from '../lessons/entities/lesson.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { Assignment } from './entities/assignment.entity';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
  ) {}

  private async findLessonOrFail(id: number): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({ where: { id } });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    return lesson;
  }

  async create(createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    const { lessonId, ...rest } = createAssignmentDto;
    const lesson = await this.findLessonOrFail(lessonId);
    const newAssignment = this.assignmentRepository.create({
      ...rest,
      lesson,
    });
    return await this.assignmentRepository.save(newAssignment);
  }

  async findAll(): Promise<Assignment[]> {
    return await this.assignmentRepository.find({
      relations: { lesson: true },
    });
  }

  async findOne(id: number): Promise<Assignment> {
    const foundAssignment = await this.assignmentRepository.findOne({
      where: { id },
      relations: { lesson: true },
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
    const { lessonId, ...rest } = updateAssignmentDto;
    Object.assign(existingAssignment, rest);
    if (lessonId) {
      existingAssignment.lesson = await this.findLessonOrFail(lessonId);
    }
    return await this.assignmentRepository.save(existingAssignment);
  }

  async remove(id: number): Promise<void> {
    const existingAssignment = await this.findOne(id);
    await this.assignmentRepository.remove(existingAssignment);
  }
}
