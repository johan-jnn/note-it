import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { Class } from '../src/classes/entities/class.entity';

const mockClassesRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

describe('ClassesController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(Class))
      .useValue(mockClassesRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('/classes (GET)', () => {
    it('should return all classes', async () => {
      const mockClasses = [
        {
          id: 1,
          name: 'Math Class',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          name: 'Science Class',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockClassesRepository.find.mockResolvedValue(mockClasses);

      return request(app.getHttpServer())
        .get('/classes')
        .expect(200)
        .expect(mockClasses);
    });
  });

  describe('/classes (POST)', () => {
    it('should create a new class', async () => {
      const newClass = { name: 'New Class' };
      const createdClass = {
        id: 1,
        ...newClass,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockClassesRepository.create.mockReturnValue(createdClass);
      mockClassesRepository.save.mockResolvedValue(createdClass);

      return request(app.getHttpServer())
        .post('/classes')
        .send(newClass)
        .expect(201)
        .expect(createdClass);
    });

    it('should return 400 for invalid data', async () => {
      return request(app.getHttpServer()).post('/classes').send({}).expect(400);
    });
  });

  describe('/classes/:id (GET)', () => {
    it('should return a class by ID', async () => {
      const mockClass = {
        id: 1,
        name: 'Math Class',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockClassesRepository.findOne.mockResolvedValue(mockClass);

      return request(app.getHttpServer())
        .get('/classes/1')
        .expect(200)
        .expect(mockClass);
    });

    it('should return 404 if class not found', async () => {
      mockClassesRepository.findOne.mockResolvedValue(null);

      return request(app.getHttpServer()).get('/classes/999').expect(404);
    });
  });

  describe('/classes/:id (PATCH)', () => {
    it('should update a class', async () => {
      const existingClass = {
        id: 1,
        name: 'Old Name',
        created_at: new Date(),
        updated_at: new Date(),
      };
      const updatedClass = {
        id: 1,
        name: 'Updated Name',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockClassesRepository.findOne.mockResolvedValue(existingClass);
      mockClassesRepository.save.mockResolvedValue(updatedClass);

      return request(app.getHttpServer())
        .patch('/classes/1')
        .send({ name: 'Updated Name' })
        .expect(200)
        .expect(updatedClass);
    });

    it('should return 404 if class to update not found', async () => {
      mockClassesRepository.findOne.mockResolvedValue(null);

      return request(app.getHttpServer())
        .patch('/classes/999')
        .send({ name: 'Updated Name' })
        .expect(404);
    });
  });

  describe('/classes/:id (DELETE)', () => {
    it('should delete a class', async () => {
      const existingClass = {
        id: 1,
        name: 'Math Class',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockClassesRepository.findOne.mockResolvedValue(existingClass);
      mockClassesRepository.remove.mockResolvedValue(existingClass);

      return request(app.getHttpServer())
        .delete('/classes/1')
        .expect(200)
        .expect({ message: 'Class with ID 1 has been successfully deleted' });
    });

    it('should return 404 if class to delete not found', async () => {
      mockClassesRepository.findOne.mockResolvedValue(null);

      return request(app.getHttpServer()).delete('/classes/999').expect(404);
    });
  });
});
