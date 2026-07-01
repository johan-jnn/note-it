import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from '../assignments/entities/assignment.entity';
import { Student } from '../accounts/entities/student.entity';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { Grade } from './entities/grade.entity';

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
}
