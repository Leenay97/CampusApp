import { memo } from 'react';

type TableRowProps = {
  columns: Record<string, string>;
};

function TableRow({ columns }: TableRowProps) {
  return (
    <div className="">
      {Object.entries(columns).map(([key, value]) => {
        return (
          <div key={key} className="">
            {value}
          </div>
        );
      })}
    </div>
  );
}

export default memo(TableRow);
