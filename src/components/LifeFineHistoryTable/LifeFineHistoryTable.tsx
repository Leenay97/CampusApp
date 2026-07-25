import { useMemo, useState } from 'react';
import styles from './LifeFineHistoryTable.module.scss';

export type GroupFineRow = {
  group: { id: string; name: string };
  total: number;
  students: string[];
};

type SortField = 'group' | 'total';
type SortOrder = 'asc' | 'desc';

const DEFAULT_ORDER: Record<SortField, SortOrder> = {
  group: 'asc',
  total: 'desc',
};

type LifeFineHistoryTableProps = {
  rows: GroupFineRow[];
};

export default function LifeFineHistoryTable({ rows }: LifeFineHistoryTableProps) {
  const [sortField, setSortField] = useState<SortField>('group');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder(DEFAULT_ORDER[field]);
    }
  }

  function renderSortArrow(field: SortField) {
    const isActive = sortField === field;
    const order = isActive ? sortOrder : DEFAULT_ORDER[field];
    return (
      <span
        className={styles['history__sort-icon']}
        style={{ visibility: isActive ? 'visible' : 'hidden' }}
      >
        {order === 'asc' ? '↑' : '↓'}
      </span>
    );
  }

  const sortedRows = useMemo(() => {
    const list = [...rows];

    if (sortField === 'group') {
      list.sort((a, b) => {
        const result = a.group.name.localeCompare(b.group.name, 'ru');
        return sortOrder === 'asc' ? result : -result;
      });
      return list;
    }

    list.sort((a, b) => {
      const result = a.total - b.total;
      return sortOrder === 'asc' ? result : -result;
    });
    return list;
  }, [rows, sortField, sortOrder]);

  return (
    <div className={styles['history']}>
      {sortedRows.length === 0 ? (
        <div className={styles['empty']}>Пока нет данных</div>
      ) : (
        <div className={styles['history__table']}>
          <div
            className={`${styles['history__cell']} ${styles['history__cell--header']} ${styles['history__sortable']} ${styles['history__student']}`}
            onClick={() => handleSort('group')}
          >
            Группа {renderSortArrow('group')}
          </div>
          <div
            className={`${styles['history__cell']} ${styles['history__cell--header']} ${styles['history__sortable']}`}
            onClick={() => handleSort('total')}
          >
            Отнято {renderSortArrow('total')}
          </div>
          <div
            className={`${styles['history__cell']} ${styles['history__cell--header']} ${styles['history__student']}`}
          >
            Студенты
          </div>

          {sortedRows.map(({ group, total, students }) => (
            <div key={group.id} className={styles['history__row']}>
              <div className={`${styles['history__cell']} ${styles['history__student']}`}>
                {group.name}
              </div>
              <div className={styles['history__cell']}>{total || '—'}</div>
              <div className={`${styles['history__cell']} ${styles['history__student']}`}>
                {students.length > 0 ? students.join(', ') : '—'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
