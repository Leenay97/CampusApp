import { useEffect, useRef, useState } from 'react';
import styles from './style.module.scss';

type MultipleSelectProps = {
  teachers: Teacher[];
  value: Teacher[];
  onChange: (value: Teacher[]) => void;
};

export function MultipleSelect({ teachers, value, onChange }: MultipleSelectProps) {
  const [filterValue, setFilterValue] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);

  console.log(teachers);

  const filteredTeachers = (teachers || []).filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(filterValue.toLowerCase()) &&
      !value.includes(teacher) &&
      teacher.group === null,
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(event.target.value);
  };

  const handleTeacherSelect = (teacher: Teacher) => {
    onChange([...value, teacher]);
    setFilterValue('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleRemoveTeacher = (teacher: Teacher) => {
    const filteredValue = value.filter((t) => t !== teacher);
    onChange(filteredValue);
  };

  useEffect(() => {
    onChange(value);
  }, [value, onChange]);

  return (
    <div className={styles['multiple-select']}>
      <div className={styles['multiple-select__field']}>
        <div className={styles['multiple-select__input']}>
          <div className={styles['multiple-select__selected']}>
            {value.map((teacher) => (
              <div
                key={teacher.id}
                className={styles['multiple-select__teacher']}
                onClick={() => handleRemoveTeacher(teacher)}
              >
                {teacher.name}
              </div>
            ))}
          </div>
          <input
            value={filterValue}
            onChange={handleInputChange}
            className={styles['multiple-select__search']}
            ref={inputRef}
          />
        </div>
      </div>
      <div className={styles['multiple-select__options']}>
        {filteredTeachers.map((teacher) => (
          <div
            key={teacher.id}
            onClick={() => handleTeacherSelect(teacher)}
            className={styles['multiple-select__teacher']}
          >
            {teacher.name}
          </div>
        ))}
      </div>
    </div>
  );
}
