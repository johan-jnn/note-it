import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Class } from '../../classes/entities/class.entity';
import { Account } from './account.entity';

@Entity('students')
export class Student {
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

  @ManyToOne(() => Class)
  @JoinColumn({
    name: 'class_id',
  })
  class: Class;

  @UpdateDateColumn()
  updated_at: Date;
}
