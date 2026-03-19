import styles from './GradeSection.module.scss';

type GradeProps = {
  selectedGrade: number;
  gradeKey?: string;
  value: string[];
  small: boolean;
  onClick?: (value: number) => void;
};

export default function Grade({ selectedGrade, gradeKey, value, small, onClick }: GradeProps) {
  if (small) {
    return (
      <div className={styles['grades__cell--small']}>
        <div className={styles['grades__icon--small']}>{value[0]}</div>
      </div>
    );
  }

  return (
    <div
      className={
        selectedGrade !== Number(gradeKey) ? styles['grades__cell'] : styles['grades__cell--active']
      }
      style={{ backgroundColor: value[2] }}
      onClick={onClick ? () => onClick(Number(gradeKey)) : undefined}
    >
      <div className={styles['grades__icon']}>{value[0]}</div>
      <div className={styles['grades__name']}>{value[1]}</div>
    </div>
  );
}
