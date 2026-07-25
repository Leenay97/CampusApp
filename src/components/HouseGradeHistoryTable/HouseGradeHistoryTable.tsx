import { useMemo, useState } from 'react';
import { House } from '@/app/types';
import styles from './HouseGradeHistoryTable.module.scss';
import { compareHouseNumbers } from '@/utils/sortHouseNumbers';
import { grades } from '@/components/GradeSection/constants';

type SortField = 'number' | 'grade' | 'avgGrade';
type SortOrder = 'asc' | 'desc';

const DEFAULT_ORDER: Record<SortField, SortOrder> = {
  number: 'asc',
  grade: 'desc',
  avgGrade: 'desc',
};

type HouseGradeHistoryTableProps = {
  houses: House[];
  gradeByHouseId: Record<string, number | undefined>;
  avgGradeByHouseId: Record<string, number | undefined>;
};

export default function HouseGradeHistoryTable({
  houses,
  gradeByHouseId,
  avgGradeByHouseId,
}: HouseGradeHistoryTableProps) {
  const [sortField, setSortField] = useState<SortField>('number');
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

  const sortedHouses = useMemo(() => {
    const list = [...houses];

    if (sortField === 'number') {
      list.sort((a, b) => {
        const result = compareHouseNumbers(a.number, b.number);
        return sortOrder === 'asc' ? result : -result;
      });
      return list;
    }

    const valueByHouseId = sortField === 'grade' ? gradeByHouseId : avgGradeByHouseId;
    list.sort((a, b) => {
      const valueA = valueByHouseId[a.id];
      const valueB = valueByHouseId[b.id];
      if (!valueA && !valueB) return 0;
      if (!valueA) return 1;
      if (!valueB) return -1;
      return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    });
    return list;
  }, [houses, sortField, sortOrder, gradeByHouseId, avgGradeByHouseId]);

  return (
    <div className={styles['history']}>
      {sortedHouses.length === 0 ? (
        <div className={styles['empty']}>Домиков нет</div>
      ) : (
        <div className={styles['history__table']}>
          <div
            className={`${styles['history__cell']} ${styles['history__cell--header']} ${styles['history__sortable']}`}
            onClick={() => handleSort('number')}
          >
            № {renderSortArrow('number')}
          </div>
          <div
            className={`${styles['history__cell']} ${styles['history__cell--header']} ${styles['history__sortable']}`}
            onClick={() => handleSort('grade')}
          >
            Оценка {renderSortArrow('grade')}
          </div>
          <div
            className={`${styles['history__cell']} ${styles['history__cell--header']} ${styles['history__sortable']}`}
            onClick={() => handleSort('avgGrade')}
          >
            Средняя {renderSortArrow('avgGrade')}
          </div>
          <div
            className={`${styles['history__cell']} ${styles['history__cell--header']} ${styles['history__students']}`}
          >
            Студенты
          </div>
          <div
            className={`${styles['history__cell']} ${styles['history__cell--header']} ${styles['history__students']}`}
          >
            Группа
          </div>

          {sortedHouses.map((house) => {
            const grade = gradeByHouseId[house.id];
            const gradeData = grade ? grades[grade] : null;
            const avgGrade = avgGradeByHouseId[house.id];
            const studentNames = house.users
              ?.map((student) => student.name || student.russianName)
              .join(', ');
            const groupNames = Array.from(
              new Set((house.users ?? []).map((student) => student.group?.name).filter(Boolean)),
            ).join(', ');

            return (
              <div key={house.id} className={styles['history__row']}>
                <div className={`${styles['history__cell']} ${styles['number']}`}>
                  {house.number}
                </div>
                <div className={styles['history__cell']}>
                  {gradeData ? `${gradeData[0]} ${grade}` : '—'}
                </div>
                <div className={`${styles['history__cell']} ${styles['history__avg']}`}>
                  {avgGrade ? avgGrade.toFixed(1) : '—'}
                </div>
                <div className={`${styles['history__cell']} ${styles['history__students']}`}>
                  {studentNames || '—'}
                </div>
                <div className={`${styles['history__cell']} ${styles['history__students']}`}>
                  {groupNames || '—'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
