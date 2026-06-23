import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { AccountsType } from '../../src/common/enums/accountsType.enum';
import created_at from './templates/created_at';
import updated_at from './templates/updated_at';

export class CreateAccountTable1782120431389 implements MigrationInterface {
  public static readonly TABLE = new Table({
    name: 'accounts',
    columns: [
      {
        name: 'id',
        type: 'char',
        length: '36',
        isPrimary: true,
        generationStrategy: 'uuid',
        isGenerated: true,
      },
      {
        name: 'email',
        type: 'varchar',
        isUnique: true,
      },
      {
        name: 'password',
        type: 'varchar',
      },
      {
        name: 'type',
        type: 'enum',
        enum: Object.values(AccountsType),
      },
      created_at(),
      updated_at(),
    ],
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(CreateAccountTable1782120431389.TABLE);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(CreateAccountTable1782120431389.TABLE);
  }
}
