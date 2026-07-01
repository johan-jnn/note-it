import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { runtimeDatasourceOptions } from '../database/sources/_resolver';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountsModule } from './accounts/accounts.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { ClassesModule } from './classes/classes.module';
import { GradesModule } from './grades/grades.module';
import { LessonsModule } from './lessons/lessons.module';
import { StaticModule } from './static/static.module';
import { SubjectsModule } from './subjects/subjects.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(runtimeDatasourceOptions(), process.env.NODE_ENV),
    AccountsModule,
    ClassesModule,
    SubjectsModule,
    LessonsModule,
    AssignmentsModule,
    GradesModule,
    StaticModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
