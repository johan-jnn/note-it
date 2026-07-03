import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';

import { options as testDsOptions } from '../database/sources/tests.datasource';
import { AccountsModule } from '../src/accounts/accounts.module';
import { AssignmentsModule } from '../src/assignments/assignments.module';
import { ClassesModule } from '../src/classes/classes.module';
import { AccountsType } from '../src/common/enums/accountsType.enum';
import { GradesModule } from '../src/grades/grades.module';
import { LessonsModule } from '../src/lessons/lessons.module';
import { SubjectsModule } from '../src/subjects/subjects.module';

/**
 * Real integration tests: a genuine in-memory SQLite database is created and
 * synchronized for every test run (no repository is mocked). Requests go
 * through the full HTTP stack (controllers -> services -> real TypeORM
 * repositories -> real database).
 */
describe('Grades (integration)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...testDsOptions,
          migrationsRun: true,
        }),
        AccountsModule,
        ClassesModule,
        SubjectsModule,
        LessonsModule,
        AssignmentsModule,
        GradesModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  interface WithId {
    id: number | string;
  }

  /** Seeds the full chain (class, teacher, subject, lesson, student, assignment) through the real HTTP API. */
  async function seedAssignment(scale: number) {
    const server = app.getHttpServer();

    const classRes = await request(server)
      .post('/api/classes')
      .send({ name: 'Terminale S' })
      .expect(201);
    const classId = (classRes.body as WithId).id as number;

    const teacherRes = await request(server)
      .post('/api/accounts')
      .send({
        email: `teacher-${Date.now()}-${Math.random()}@example.com`,
        type: AccountsType.Teacher,
        first_name: 'Ada',
        last_name: 'Lovelace',
      })
      .expect(201);
    const teacherId = (teacherRes.body as WithId).id as string;

    const subjectRes = await request(server)
      .post('/api/subjects')
      .send({ name: 'Mathematics', ownerId: teacherId })
      .expect(201);
    const subjectId = (subjectRes.body as WithId).id as number;

    const lessonRes = await request(server)
      .post('/api/lessons')
      .send({ classId, teacherId, subjectId })
      .expect(201);
    const lessonId = (lessonRes.body as WithId).id as number;

    const studentRes = await request(server)
      .post('/api/accounts')
      .send({
        email: `student-${Date.now()}-${Math.random()}@example.com`,
        type: AccountsType.Student,
        first_name: 'Alan',
        last_name: 'Turing',
        classId,
      })
      .expect(201);
    const studentId = (studentRes.body as WithId).id as string;

    const assignmentRes = await request(server)
      .post('/api/assignments')
      .send({ title: 'Test', scale, lessonId })
      .expect(201);
    const assignmentId = (assignmentRes.body as WithId).id as number;

    return { subjectId, studentId, assignmentId };
  }

  describe('/grades (POST)', () => {
    it('creates a grade for a real student/assignment pair (nominal case)', async () => {
      const { studentId, assignmentId } = await seedAssignment(20);

      const res = await request(app.getHttpServer())
        .post('/api/grades')
        .send({ value: 15, assignmentId, studentId })
        .expect(201);

      expect(res.body).toMatchObject({
        value: 15,
        assignment: { id: assignmentId },
        student: { id: studentId },
      });
      expect((res.body as WithId).id).toEqual(expect.any(Number));
    });

    it('rejects a grade value above 20 (error case)', async () => {
      const { studentId, assignmentId } = await seedAssignment(20);

      const res = await request(app.getHttpServer())
        .post('/api/grades')
        .send({ value: 25, assignmentId, studentId })
        .expect(400);

      expect(res.body).toMatchObject({ statusCode: 400 });
    });

    it('returns 404 when the referenced student does not exist', async () => {
      const { assignmentId } = await seedAssignment(20);

      const res = await request(app.getHttpServer())
        .post('/api/grades')
        .send({
          value: 15,
          assignmentId,
          studentId: '00000000-0000-4000-8000-000000000000',
        })
        .expect(404);

      expect(res.body).toMatchObject({ statusCode: 404 });
    });
  });

  describe('/grades/average/:studentId/:subjectId (GET)', () => {
    it('computes the real weighted average from grades stored in the database', async () => {
      const { studentId, subjectId, assignmentId } = await seedAssignment(20);

      await request(app.getHttpServer())
        .post('/api/grades')
        .send({ value: 12, assignmentId, studentId })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get(`/api/grades/average/${studentId}/${subjectId}`)
        .expect(200);

      expect(res.body).toEqual({ average: 12, validated: true });
    });

    it('returns 404 for a subject that does not exist', async () => {
      const { studentId } = await seedAssignment(20);

      const res = await request(app.getHttpServer())
        .get(`/api/grades/average/${studentId}/999999`)
        .expect(404);

      expect(res.body).toMatchObject({ statusCode: 404 });
    });
  });
});
