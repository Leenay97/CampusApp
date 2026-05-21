import { memo } from 'react';
import TableRow from './TableRow';

type TableProps = {
  columns: Record<string, string>;
  rows: [];
};

function Table({ columns, rows }: TableProps) {
  return (
    <div className="">
      {rows.map((item) => (
        <TableRow key={item} columns={columns} />
      ))}
    </div>
  );
}

export default memo(Table);
