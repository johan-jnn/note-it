import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson } from './entities/lesson.entity';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
  ) {}

  async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    const newLesson = this.lessonRepository.create(createLessonDto);
    return await this.lessonRepository.save(newLesson);
  }

  async findAll(): Promise<Lesson[]> {
    return await this.lessonRepository.find();
  }

  async findOne(id: number): Promise<Lesson> {
    const foundLesson = await this.lessonRepository.findOne({ where: { id } });
    if (!foundLesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    return foundLesson;
  }

  async update(id: number, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    const existingLesson = await this.findOne(id);
    Object.assign(existingLesson, updateLessonDto);
    return await this.lessonRepository.save(existingLesson);
  }

  async remove(id: number): Promise<void> {
    const existingLesson = await this.findOne(id);
    await this.lessonRepository.remove(existingLesson);
  }
}
