import { useMemo } from 'react';
import styles from './style.module.scss';

type TeachersListProps = {
  teachers: Teacher[];
  isLoading: boolean;
  onDelete: (teacher: Teacher | null) => void;
};

export function TeachersList({ teachers, isLoading, onDelete }: TeachersListProps) {
  const sortedTeachers = useMemo(() => {
    if (!Array.isArray(teachers)) return [];
    return [...teachers].sort((a, b) => a.name.localeCompare(b.name));
  }, [teachers]);

  console.log(sortedTeachers);

  if (isLoading) {
    return <div className="section">Loading...</div>;
  }

  if (!sortedTeachers.length) {
    return <div className="section">Нет учителей</div>;
  }

  return (
    <div className="className">
      <h2 className="subtitle">Список учителей</h2>
      <ul className={styles['teachers-list']}>
        {sortedTeachers &&
          sortedTeachers.map((teacher) => (
            <li key={teacher.id}>
              <div className={styles['teachers-list__teacher']}>{teacher.name}</div>
              <button className={styles['teachers-list__delete']} onClick={() => onDelete(teacher)}>
                &times;
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
}
