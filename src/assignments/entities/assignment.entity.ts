import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Lesson } from '../../lessons/entities/lesson.entity';

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('varchar')
  title: string;

  @Column('datetime', {
    nullable: true,
  })
  begin_date: Date;
  @Column('datetime', {
    nullable: true,
  })
  end_date: Date;

  /**
   * Correspond to the maximum value of the assignment's grades
   * Must be in `[1; inf[`
   */
  @Column('integer', {
    unsigned: true,
  })
  scale: number;

  @Column('float', {
    precision: 2,
    default: 1,
  })
  coefficient: number;

  @ManyToOne(() => Lesson)
  @JoinColumn({
    name: 'lesson_id',
  })
  lesson: Lesson;

  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
