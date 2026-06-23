import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Assignment } from '../../assignments/entities/assignment.entity';
import { Student } from '../../auth/entities/student.entity';

@Entity('grades')
export class Grade {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    type: 'float',
    precision: 2,
  })
  value: number;
  @Column('string', {
    nullable: true,
  })
  comment?: string;

  @ManyToOne(() => Assignment)
  @JoinColumn({
    name: 'assignment_id',
  })
  assignment: Assignment;

  @ManyToOne(() => Student)
  @JoinColumn({
    name: 'student_id',
  })
  student: Student;

  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
