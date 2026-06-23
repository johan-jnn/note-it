import { TableColumn } from 'typeorm';

export default (name = 'created_at', comment?: string) =>
  new TableColumn({
    name,
    type: 'datetime',
    default: 'NOW()',
    comment,
  });
