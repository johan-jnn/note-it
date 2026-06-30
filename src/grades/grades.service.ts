import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { Grade } from './entities/grade.entity';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
  ) {}

  async create(createGradeDto: CreateGradeDto): Promise<Grade> {
    const newGrade = this.gradeRepository.create(createGradeDto);
    return await this.gradeRepository.save(newGrade);
  }

  async findAll(): Promise<Grade[]> {
    return await this.gradeRepository.find();
  }

  async findOne(id: number): Promise<Grade> {
    const foundGrade = await this.gradeRepository.findOne({ where: { id } });
    if (!foundGrade) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }
    return foundGrade;
  }

  async update(id: number, updateGradeDto: UpdateGradeDto): Promise<Grade> {
    const existingGrade = await this.findOne(id);
    Object.assign(existingGrade, updateGradeDto);
    return await this.gradeRepository.save(existingGrade);
  }

  async remove(id: number): Promise<void> {
    const existingGrade = await this.findOne(id);
    await this.gradeRepository.remove(existingGrade);
  }
}
