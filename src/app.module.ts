import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import appDatasource from '../database/sources/app.datasource';
import localDatasource from '../database/sources/local.datasource';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ClassesModule } from './classes/classes.module';
import { SubjectsModule } from './subjects/subjects.module';
import { LessonsModule } from './lessons/lessons.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { GradesModule } from './grades/grades.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(
      (process.env.NODE_ENV === 'production' ? appDatasource : localDatasource)
        .options,
    ),
    AuthModule,
    ClassesModule,
    SubjectsModule,
    LessonsModule,
    AssignmentsModule,
    GradesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
