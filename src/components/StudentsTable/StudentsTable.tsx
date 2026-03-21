import { useState, useMemo } from 'react';
import { User } from '@/app/types';
import styles from './StudentsTable.module.scss';

type SortField = 'name' | 'group' | 'house' | 'coins';
type SortOrder = 'asc' | 'desc';

export default function StudentsTable({ students }: { students: User[] }) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Обработчик клика на заголовок
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Если сортируем по тому же полю, меняем порядок
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Если новое поле, устанавливаем его и порядок по умолчанию (asc)
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Функция для получения значения поля для сортировки
  const getSortValue = (student: User, field: SortField): string | number => {
    switch (field) {
      case 'name':
        return student?.name || '';
      case 'group':
        return student?.group?.name || '';
      case 'house':
        return student?.house?.number || 0;
      case 'coins':
        return student?.coins || 0;
      default:
        return '';
    }
  };

  // Сортировка студентов
  const sortedStudents = useMemo(() => {
    if (!students || students.length === 0) return [];

    return [...students].sort((a, b) => {
      const valueA = getSortValue(a, sortField);
      const valueB = getSortValue(b, sortField);

      // Числовая сортировка
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
      }

      // Строковая сортировка
      const stringA = String(valueA).toLowerCase();
      const stringB = String(valueB).toLowerCase();

      if (sortOrder === 'asc') {
        return stringA.localeCompare(stringB);
      } else {
        return stringB.localeCompare(stringA);
      }
    });
  }, [students, sortField, sortOrder]);

  // Функция для отображения иконки сортировки
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  if (students.length === 0) {
    return (
      <div className={styles['students']}>
        <div className={styles['empty']}>Нет студентов</div>
      </div>
    );
  }

  return (
    <div className={styles['students']}>
      <div className={styles['students__table']}>
        <div className={styles['students__header']}>
          <div
            className={`${styles['students__cell']} ${styles['sortable']}`}
            onClick={() => handleSort('name')}
          >
            Имя {getSortIcon('name')}
          </div>
          <div
            className={`${styles['students__cell']} ${styles['sortable']}`}
            onClick={() => handleSort('group')}
          >
            Группа {getSortIcon('group')}
          </div>
          <div
            className={`${styles['students__cell']} ${styles['sortable']}`}
            onClick={() => handleSort('house')}
          >
            Домик {getSortIcon('house')}
          </div>
          <div
            className={`${styles['students__cell']} ${styles['sortable']}`}
            onClick={() => handleSort('coins')}
          >
            Coins {getSortIcon('coins')}
          </div>
        </div>

        {sortedStudents.map((student) => (
          <div key={student.id} className={styles['students__row']}>
            <div className={styles['students__cell']}>{student?.name || '—'}</div>
            <div className={styles['students__cell']}>{student?.group?.name || '—'}</div>
            <div className={styles['students__cell']}>{student?.house?.number || '—'}</div>
            <div className={styles['students__cell']}>{student?.coins || '0'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
