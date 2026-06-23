import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import created_at from './templates/created_at';
import updated_at from './templates/updated_at';

export class CreateSubjectsTable1782145956928 implements MigrationInterface {
  public static readonly TABLE = new Table({
    name: 'subjects',
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
      },
      {
        name: 'description',
        type: 'varchar',
        length: '512',
        isNullable: true,
      },
      {
        name: 'created_by',
        type: 'char',
        length: '36',
      },

      created_at(),
      updated_at(),
    ],
    foreignKeys: [
      {
        columnNames: ['created_by'],
        referencedTableName: 'teachers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    ],
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(CreateSubjectsTable1782145956928.TABLE);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(CreateSubjectsTable1782145956928.TABLE);
  }
}
