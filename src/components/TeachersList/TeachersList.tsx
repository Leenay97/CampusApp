import { useMemo } from 'react';
import styles from './style.module.scss';

type TeachersListProps = {
  teachers: Teacher[];
  onDelete: (id: string, name: string) => void;
};

export function TeachersList({ teachers, onDelete }: TeachersListProps) {
  const sortedTeachers = useMemo(() => {
    if (!Array.isArray(teachers)) return [];
    return [...teachers].sort((a, b) => a.name.localeCompare(b.name));
  }, [teachers]);

  if (!sortedTeachers.length) return;

  return (
    <div className="className">
      <h2 className="subtitle">Список учителей</h2>
      <ul className={styles['teachers-list']}>
        {sortedTeachers &&
          sortedTeachers.map((teacher) => (
            <li key={teacher.id}>
              <div className={styles['teachers-list__teacher']}>{teacher.name}</div>
              <button
                className={styles['teachers-list__delete']}
                onClick={() => onDelete(teacher.id, teacher.name)}
              >
                &times;
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
}
