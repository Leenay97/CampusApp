import { Schedule } from '@/app/types';
import styles from './ScheduleBuilderRow.module.scss';
import { InputField } from '@/components/InputField/InputField';

type Props = {
  schedule: Schedule;
  editMode?: boolean;
  onChange?: (data: Partial<Schedule>) => void;
  onAdd?: () => void;
  onDelete?: () => void;
};

export default function ScheduleBuilderRow({
  schedule,
  editMode,
  onChange,
  onAdd,
  onDelete,
}: Props) {
  if (editMode) {
    return (
      <div className={styles['schedule-row']}>
        <InputField
          width="95px"
          type="time"
          value={schedule.time}
          onChange={(value) => onChange?.({ time: value })}
          style={{ fontSize: '16px', color: '#f46767', fontWeight: 'bold' }}
        />
        <div></div>
        <InputField
          value={schedule.activity}
          onChange={(value) => onChange?.({ activity: value })}
          style={{ fontSize: '16px', color: '#4a90be', fontWeight: 'bold' }}
        />

        <div className={styles['schedule-row__buttons']}>
          <button className={styles['schedule-row__add']} onClick={onAdd}></button>
          <button className={styles['schedule-row__delete']} onClick={onDelete} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles['schedule-row']}>
      <div className={styles['schedule-row__time']}>{schedule.time}</div>
      <div className={styles['schedule-row__dot']}></div>
      <div className={styles['schedule-row__activity']}>{schedule.activity}</div>
    </div>
  );
}
