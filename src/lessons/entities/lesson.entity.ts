import { Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Teacher } from '../../accounts/entities/teacher.entity';
import { Class } from '../../classes/entities/class.entity';
import { Subject } from '../../subjects/entities/subject.entity';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('varchar', {
    nullable: true,
  })
  name?: string;

  /**
   * This returns the name of the lesson or, if not defined,
   * the name of the lesson's subject's name
   */
  @Expose()
  get real_name(): string {
    return this.name ?? this.subject.name;
  }

  @ManyToOne(() => Class)
  @JoinColumn({
    name: 'class_id',
  })
  class: Class;

  @ManyToOne(() => Teacher)
  @JoinColumn({
    name: 'teacher_id',
  })
  teacher: Teacher;

  @ManyToOne(() => Subject)
  @JoinColumn({
    name: 'subject_id',
  })
  subject: Subject;

  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
