import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from '../assignments/entities/assignment.entity';
import { Student } from '../accounts/entities/student.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { Grade } from './entities/grade.entity';
import {
  computeWeightedAverage,
  isSubjectValidated,
} from './grade-average.util';

const GRADE_RELATIONS = { assignment: true, student: true };

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {}

  private async findAssignmentOrFail(id: number): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
    });
    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }
    return assignment;
  }

  private async findStudentOrFail(id: string): Promise<Student> {
    const student = await this.studentRepository.findOne({ where: { id } });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  private async findSubjectOrFail(id: number): Promise<Subject> {
    const subject = await this.subjectRepository.findOne({ where: { id } });
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }
    return subject;
  }

  async create(createGradeDto: CreateGradeDto): Promise<Grade> {
    const { assignmentId, studentId, ...rest } = createGradeDto;
    const [assignment, student] = await Promise.all([
      this.findAssignmentOrFail(assignmentId),
      this.findStudentOrFail(studentId),
    ]);
    const newGrade = this.gradeRepository.create({
      ...rest,
      assignment,
      student,
    });
    return await this.gradeRepository.save(newGrade);
  }

  async findAll(): Promise<Grade[]> {
    return await this.gradeRepository.find({ relations: GRADE_RELATIONS });
  }

  async findOne(id: number): Promise<Grade> {
    const foundGrade = await this.gradeRepository.findOne({
      where: { id },
      relations: GRADE_RELATIONS,
    });
    if (!foundGrade) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }
    return foundGrade;
  }

  async update(id: number, updateGradeDto: UpdateGradeDto): Promise<Grade> {
    const existingGrade = await this.findOne(id);
    const { assignmentId, studentId, ...rest } = updateGradeDto;
    Object.assign(existingGrade, rest);
    if (assignmentId) {
      existingGrade.assignment = await this.findAssignmentOrFail(assignmentId);
    }
    if (studentId) {
      existingGrade.student = await this.findStudentOrFail(studentId);
    }
    return await this.gradeRepository.save(existingGrade);
  }

  async remove(id: number): Promise<void> {
    const existingGrade = await this.findOne(id);
    await this.gradeRepository.remove(existingGrade);
  }

  /**
   * Weighted average (normalized on /20, weighted by assignment coefficient)
   * of a student's grades for a given subject. Returns null if the student
   * has no grade yet for that subject.
   */
  async getStudentSubjectAverage(
    studentId: string,
    subjectId: number,
  ): Promise<number | null> {
    await this.findStudentOrFail(studentId);
    await this.findSubjectOrFail(subjectId);

    const grades = await this.gradeRepository.find({
      where: {
        student: { id: studentId },
        assignment: { lesson: { subject: { id: subjectId } } },
      },
      relations: { assignment: true },
    });

    return computeWeightedAverage(grades);
  }

  /**
   * Whether a student validates a subject, based on the subject average
   * threshold (see `SUBJECT_VALIDATION_THRESHOLD`). Returns null if there is
   * no average to judge yet (no grades).
   */
  async isStudentSubjectValidated(
    studentId: string,
    subjectId: number,
    threshold?: number,
  ): Promise<boolean | null> {
    const average = await this.getStudentSubjectAverage(studentId, subjectId);
    return isSubjectValidated(average, threshold);
  }
}
