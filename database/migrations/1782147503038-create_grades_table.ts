import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import created_at from './templates/created_at';
import updated_at from './templates/updated_at';

export class CreateGradesTable1782147503038 implements MigrationInterface {
  public static readonly TABLE = new Table({
    name: 'grades',
    columns: [
      {
        name: 'id',
        type: 'integer',
        unsigned: true,
        isPrimary: true,
        generationStrategy: 'identity',
        isGenerated: true,
      },
      {
        name: 'assignment_id',
        type: 'integer',
        unsigned: true,
      },
      {
        name: 'student_id',
        type: 'char',
        length: '36',
      },

      {
        name: 'value',
        type: 'float',
        precision: 2,
      },

      {
        name: 'comment',
        type: 'varchar',
        length: '1024',
        isNullable: true,
      },

      created_at(),
      updated_at(),
    ],

    foreignKeys: [
      {
        columnNames: ['assignment_id'],
        referencedTableName: 'assignments',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      {
        columnNames: ['student_id'],
        referencedTableName: 'students',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    ],
    uniques: [
      {
        columnNames: ['assignment_id', 'student_id'],
      },
    ],
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(CreateGradesTable1782147503038.TABLE);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(CreateGradesTable1782147503038.TABLE);
  }
}
