import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccountsType } from '../../common/enums/accountsType.enum';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('string', {
    unique: true,
  })
  email: string;
  @Column('string')
  password: string;

  @Column({
    type: 'enum',
    enum: () => AccountsType,
  })
  type: AccountsType;

  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
