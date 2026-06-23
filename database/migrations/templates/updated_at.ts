import { TableColumn } from 'typeorm';

export default (name = 'updated_at', comment?: string) =>
  new TableColumn({
    name,
    type: 'datetime',
    default: 'NOW()',
    comment,
  });
