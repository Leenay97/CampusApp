import { useState } from 'react';
import styles from './style.module.scss';

type CustomSelectProps = {
  teachers: Teacher[];
  value: Teacher;
  onChange: (value: Teacher) => void;
};

export function TeacherCustomSelect({ teachers, onChange }: CustomSelectProps) {
  const [filterValue, setFilterValue] = useState<string>('');
  const [showTeachers, setShowTeachers] = useState<boolean>(false);
  if (!teachers || !teachers.length) return null;

  console.log(teachers);

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name.toLowerCase().includes(filterValue.toLowerCase()),
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(event.target.value);
  };

  const handleTeacherSelect = (teacher: Teacher) => {
    onChange(teacher);
    console.log(teacher.name);
    setFilterValue(teacher.name);
    setShowTeachers(false);
  };

  return (
    <div className={styles['custom-select']}>
      <input
        className={styles['custom-select__input']}
        onFocus={() => {
          setShowTeachers(true);
        }}
        // onBlur={() => {
        //   setShowTeachers(false);
        // }}
        value={filterValue}
        onChange={handleInputChange}
      />
      {showTeachers && (
        <ul className={styles['custom-select__list']}>
          {filteredTeachers.map((teacher) => (
            <li
              key={teacher.id}
              className={styles['custom-select__option']}
              onClick={() => handleTeacherSelect(teacher)}
            >
              {' '}
              {teacher.name}{' '}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
