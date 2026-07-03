import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from '../classes/entities/class.entity';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { Account } from './entities/account.entity';
import { Student } from './entities/student.entity';
import { Teacher } from './entities/teacher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Class, Account, Student, Teacher])],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
