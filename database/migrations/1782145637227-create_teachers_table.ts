import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import updated_at from './templates/updated_at';

export class CreateTeachersTable1782145637227 implements MigrationInterface {
  public static readonly TABLE = new Table({
    name: 'teachers',
    columns: [
      {
        name: 'id',
        type: 'char',
        length: '36',
        isPrimary: true,
        isGenerated: false,
      },
      {
        name: 'first_name',
        type: 'varchar',
        length: '30',
      },
      {
        name: 'last_name',
        type: 'varchar',
        length: '50',
      },

      {
        name: 'director_id',
        type: 'char',
        length: '36',
        isNullable: true,
      },

      // The created_at is in the account column
      updated_at(),
    ],
    foreignKeys: [
      {
        columnNames: ['id'],
        referencedTableName: 'accounts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      {
        columnNames: ['director_id'],
        referencedTableName: 'teachers',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
    ],
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(CreateTeachersTable1782145637227.TABLE);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(CreateTeachersTable1782145637227.TABLE);
  }
}
