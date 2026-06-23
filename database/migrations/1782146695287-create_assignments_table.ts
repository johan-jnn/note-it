import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import created_at from './templates/created_at';
import updated_at from './templates/updated_at';

export class CreateAssignmentsTable1782146695287 implements MigrationInterface {
  public static readonly TABLE = new Table({
    name: 'assignments',
    comment:
      'This table represents only an assignment, but is not the assignment itself.',
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
        name: 'title',
        type: 'varchar',
        length: '128',
      },
      {
        name: 'begin_date',
        type: 'datetime',
        isNullable: true,
        comment: 'Must be set if end_date is set.',
      },
      {
        name: 'end_date',
        type: 'datetime',
        isNullable: true,
        comment: 'Must be set if begin_date is set.',
      },

      {
        name: 'scale',
        type: 'integer',
        unsigned: true,
        comment: 'The max possible value of a grade',
        default: 20,
      },
      {
        name: 'coefficient',
        type: 'float',
        precision: 2,
        default: 1,
      },

      {
        name: 'lesson_id',
        type: 'integer',
        unsigned: true,
      },

      created_at(),
      updated_at(),
    ],
    foreignKeys: [
      {
        columnNames: ['lesson_id'],
        referencedTableName: 'lessons',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    ],
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(CreateAssignmentsTable1782146695287.TABLE);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(CreateAssignmentsTable1782146695287.TABLE);
  }
}
