import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RmAccountPsw1782915915499 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('accounts', 'password');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'accounts',
      new TableColumn({
        name: 'password',
        type: 'varchar',
      }),
    );
  }
}
