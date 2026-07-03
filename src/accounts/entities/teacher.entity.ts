import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from './account.entity';

@Entity('teachers')
export class Teacher {
  @PrimaryColumn('uuid')
  id: string;

  @Column('varchar')
  first_name: string;
  @Column('varchar')
  last_name: string;

  @OneToOne(() => Account)
  @JoinColumn({
    name: 'id',
  })
  account: Account;

  /**
   * If not defined, the teacher is a director
   */
  @ManyToOne(() => Teacher)
  @JoinColumn({
    name: 'director_id',
  })
  director?: Teacher;

  @OneToMany(() => Teacher, (teacher) => teacher.director)
  manages: Teacher[];

  @UpdateDateColumn()
  updated_at: Date;
}
