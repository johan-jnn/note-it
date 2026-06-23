import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import updated_at from './templates/updated_at';

export class CreateStudentsTable1782145351412 implements MigrationInterface {
  public static readonly TABLE = new Table({
    name: 'students',
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
        name: 'class_id',
        type: 'integer',
        unsigned: true,
      },

      // The created_at is in the account table
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
        columnNames: ['class_id'],
        referencedTableName: 'classes',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
    ],
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(CreateStudentsTable1782145351412.TABLE);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(CreateStudentsTable1782145351412.TABLE);
  }
}
