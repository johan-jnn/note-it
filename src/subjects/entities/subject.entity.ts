import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Teacher } from '../../auth/entities/teacher.entity';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('string')
  name: string;

  @Column('string', {
    nullable: true,
  })
  description?: string;

  /**
   * This is not by which the subject is presented, but
   * which has created the subject (and by so who can delete it).
   *
   * Generally you'll want to assign this to a director.
   */
  @ManyToOne(() => Teacher)
  @JoinColumn({
    name: 'created_by',
  })
  owner: Teacher;

  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
