import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Subject } from './entities/subject.entity';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {}

  async create(createSubjectDto: CreateSubjectDto): Promise<Subject> {
    const newSubject = this.subjectRepository.create(createSubjectDto);
    return await this.subjectRepository.save(newSubject);
  }

  async findAll(): Promise<Subject[]> {
    return await this.subjectRepository.find();
  }

  async findOne(id: number): Promise<Subject> {
    const foundSubject = await this.subjectRepository.findOne({
      where: { id },
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
    Object.assign(existingSubject, updateSubjectDto);
    return await this.subjectRepository.save(existingSubject);
  }

  async remove(id: number): Promise<void> {
    const existingSubject = await this.findOne(id);
    await this.subjectRepository.remove(existingSubject);
  }
}
