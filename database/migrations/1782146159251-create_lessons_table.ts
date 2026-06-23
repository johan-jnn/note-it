import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import created_at from './templates/created_at';
import updated_at from './templates/updated_at';

export class CreateLessonsTable1782146159251 implements MigrationInterface {
  public static readonly TABLE = new Table({
    name: 'lessons',
    columns: [
      {
        name: 'id',
        type: 'integer',
        unsigned: true,
        isPrimary: true,
        generationStrategy: 'increment',
        isGenerated: true,
      },
      {
        name: 'name',
        type: 'varchar',
        length: '60',
        isNullable: true,
        comment: "If null, fallback to the subject's name",
      },
      {
        name: 'class_id',
        type: 'integer',
        unsigned: true,
      },
      {
        name: 'teacher_id',
        type: 'char',
        length: '36',
      },
      {
        name: 'subject_id',
        type: 'integer',
        unsigned: true,
      },

      created_at(),
      updated_at(),
    ],
    foreignKeys: [
      {
        columnNames: ['class_id'],
        referencedTableName: 'classes',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      {
        columnNames: ['teacher_id'],
        referencedTableName: 'teachers',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      {
        columnNames: ['subject_id'],
        referencedTableName: 'subjects',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    ],
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(CreateLessonsTable1782146159251.TABLE);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(CreateLessonsTable1782146159251.TABLE);
  }
}
