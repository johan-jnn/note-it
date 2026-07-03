import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from '../accounts/entities/teacher.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Subject } from './entities/subject.entity';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) {}

  private async findTeacherOrFail(id: string): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({ where: { id } });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }
    return teacher;
  }

  async create(createSubjectDto: CreateSubjectDto): Promise<Subject> {
    const { ownerId, ...rest } = createSubjectDto;
    const owner = await this.findTeacherOrFail(ownerId);
    const newSubject = this.subjectRepository.create({ ...rest, owner });
    return await this.subjectRepository.save(newSubject);
  }

  async findAll(): Promise<Subject[]> {
    return await this.subjectRepository.find({ relations: { owner: true } });
  }

  async findOne(id: number): Promise<Subject> {
    const foundSubject = await this.subjectRepository.findOne({
      where: { id },
      relations: { owner: true },
    });
    if (!foundSubject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }
    return foundSubject;
  }

  async update(
    id: number,
    updateSubjectDto: UpdateSubjectDto,
  ): Promise<Subject> {
    const existingSubject = await this.findOne(id);
    const { ownerId, ...rest } = updateSubjectDto;
    Object.assign(existingSubject, rest);
    if (ownerId) {
      existingSubject.owner = await this.findTeacherOrFail(ownerId);
    }
    return await this.subjectRepository.save(existingSubject);
  }

  async remove(id: number): Promise<void> {
    const existingSubject = await this.findOne(id);
    await this.subjectRepository.remove(existingSubject);
  }
}
