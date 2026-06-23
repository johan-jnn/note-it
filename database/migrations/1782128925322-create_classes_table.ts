import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import created_at from './templates/created_at';
import updated_at from './templates/updated_at';

export class CreateClassesTable1782128925322 implements MigrationInterface {
  public static readonly TABLE = new Table({
    name: 'classes',
    columns: [
      {
        name: 'id',
        type: 'integer',
        unsigned: true,
        generationStrategy: 'increment',
        isPrimary: true,
      },
      {
        name: 'name',
        type: 'varchar',
        length: '60',
      },
      created_at(),
      updated_at(),
    ],
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(CreateClassesTable1782128925322.TABLE);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(CreateClassesTable1782128925322.TABLE);
  }
}
