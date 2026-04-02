import { useState, useMemo } from 'react';
import { User } from '@/app/types';
import styles from './StudentsTable.module.scss';
import EditButton from '../EditButton/EditButton';
import EditStudentModal from '../EditStudentModal/EditStudentModal';

type SortField = 'name' | 'group' | 'house' | 'coins' | 'class' | 'englishLevel';
type SortOrder = 'asc' | 'desc';

export default function StudentsTable({
  students,
  refetch,
}: {
  students: User[];
  refetch: () => void;
}) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

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
      case 'class':
        return student?.class?.name;
      case 'englishLevel':
        return student?.englishLevel || '';
      default:
        return '';
    }
  };

  const sortedStudents = useMemo(() => {
    if (!students || students.length === 0) return [];

    return [...students].sort((a, b) => {
      const valueA = getSortValue(a, sortField);
      const valueB = getSortValue(b, sortField);

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
      }

      const stringA = String(valueA).toLowerCase();
      const stringB = String(valueB).toLowerCase();

      if (sortOrder === 'asc') {
        return stringA.localeCompare(stringB);
      } else {
        return stringB.localeCompare(stringA);
      }
    });
  }, [students, sortField, sortOrder]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '';
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
            onClick={() => handleSort('class')}
          >
            Класс {getSortIcon('class')}
          </div>
          <div
            className={`${styles['students__cell']} ${styles['sortable']}`}
            onClick={() => handleSort('class')}
          >
            Уровень языка {getSortIcon('class')}
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
            <div className={styles['students__cell']}>{student?.class?.name || '—'}</div>
            <div className={styles['students__cell']}>{student?.englishLevel || '—'}</div>
            <div className={styles['students__cell']}>{student?.coins || '0'}</div>
            <EditButton onClick={() => setSelectedStudent(student)} />
          </div>
        ))}
      </div>
      {selectedStudent && (
        <EditStudentModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onSubmit={refetch}
        />
      )}
    </div>
  );
}
