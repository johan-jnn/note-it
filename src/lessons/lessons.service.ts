import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from '../accounts/entities/teacher.entity';
import { Class } from '../classes/entities/class.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson } from './entities/lesson.entity';

const LESSON_RELATIONS = { class: true, teacher: true, subject: true };

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {}

  private async findClassOrFail(id: number): Promise<Class> {
    const foundClass = await this.classRepository.findOne({ where: { id } });
    if (!foundClass) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return foundClass;
  }

  private async findTeacherOrFail(id: string): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({ where: { id } });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }
    return teacher;
  }

  private async findSubjectOrFail(id: number): Promise<Subject> {
    const subject = await this.subjectRepository.findOne({ where: { id } });
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }
    return subject;
  }

  async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    const { classId, teacherId, subjectId, ...rest } = createLessonDto;
    const [classEntity, teacher, subject] = await Promise.all([
      this.findClassOrFail(classId),
      this.findTeacherOrFail(teacherId),
      this.findSubjectOrFail(subjectId),
    ]);
    const newLesson = this.lessonRepository.create({
      ...rest,
      class: classEntity,
      teacher,
      subject,
    });
    return await this.lessonRepository.save(newLesson);
  }

  async findAll(): Promise<Lesson[]> {
    return await this.lessonRepository.find({ relations: LESSON_RELATIONS });
  }

  async findOne(id: number): Promise<Lesson> {
    const foundLesson = await this.lessonRepository.findOne({
      where: { id },
      relations: LESSON_RELATIONS,
    });
    if (!foundLesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    return foundLesson;
  }

  async update(id: number, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    const existingLesson = await this.findOne(id);
    const { classId, teacherId, subjectId, ...rest } = updateLessonDto;
    Object.assign(existingLesson, rest);
    if (classId) {
      existingLesson.class = await this.findClassOrFail(classId);
    }
    if (teacherId) {
      existingLesson.teacher = await this.findTeacherOrFail(teacherId);
    }
    if (subjectId) {
      existingLesson.subject = await this.findSubjectOrFail(subjectId);
    }
    return await this.lessonRepository.save(existingLesson);
  }

  async remove(id: number): Promise<void> {
    const existingLesson = await this.findOne(id);
    await this.lessonRepository.remove(existingLesson);
  }
}
