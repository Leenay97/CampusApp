import { useState } from 'react';
import { grades } from './constants';
import Grade from './Grade';
import styles from './GradeSection.module.scss';

type GradeSectionProps = {
  selectedGrade: number;
  onChange: (value: number) => void;
};

export default function GradeSection({ selectedGrade, onChange }: GradeSectionProps) {
  const [options, setOptions] = useState(false);

  function toggleOptions() {
    setOptions((prev) => !prev);
  }

  function handleChange(value: number) {
    onChange(value);
    toggleOptions();
  }

  return (
    <>
      <div
        className={styles['grades__cell']}
        style={{
          backgroundColor: selectedGrade > 0 ? grades[selectedGrade][2] : '#E8E8E8',
        }}
        onClick={toggleOptions}
      >
        <div className={styles['grades__icon']}>
          {selectedGrade > 0 ? grades[selectedGrade][0] : ''}
        </div>
        <div className={styles['grades__name']}>
          {selectedGrade > 0 ? grades[selectedGrade][1] : 'Нет оценки'}
        </div>
      </div>

      {options && (
        <div className={styles['grades']}>
          <div
            className={
              selectedGrade !== 0 ? styles['grades__cell'] : styles['grades__cell--active']
            }
            onClick={() => handleChange(0)}
          >
            <div className={styles['grades__name']}>Нет оценки</div>
          </div>

          {Object.entries(grades).map(([key, value]) => (
            <Grade
              key={key}
              gradeKey={key}
              selectedGrade={selectedGrade}
              value={value}
              onClick={handleChange}
            />
          ))}
        </div>
      )}
    </>
  );
}
