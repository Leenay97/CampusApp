import { Schedule } from '@/app/types';
import { useEffect, useRef, useState } from 'react';
import styles from './ScheduleBuilderRow.module.scss';
import { InputField } from '@/components/InputField/InputField';
import ActionButton from '@/components/ActionButton/ActionButton';
import { EMOJI_CHOICES, getActivityIcon } from '../constants';
import { useUser } from '@/contexts/UserContext';

const CHAT_ROOM_PATTERN = /chat\s*room/i;

export type ScheduleRowState = 'past' | 'now' | 'future';

type Props = {
  schedule: Schedule;
  editMode?: boolean;
  state?: ScheduleRowState;
  onChange?: (data: Partial<Schedule>) => void;
  onAdd?: () => void;
  onDelete?: () => void;
};

export default function ScheduleBuilderRow({
  schedule,
  editMode,
  state,
  onChange,
  onAdd,
  onDelete,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  const icon = schedule.icon || getActivityIcon(schedule.activity);
  const isChatRoom = CHAT_ROOM_PATTERN.test(schedule.activity ?? '');
  const placeName = user?.class?.place?.name;

  console.log(user);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  function handlePickIcon(emoji: string) {
    onChange?.({ icon: emoji });
    setShowPicker(false);
  }

  if (editMode && onAdd && onDelete) {
    return (
      <div className={`${styles['schedule-row']} ${styles['schedule-row--edit']}`}>
        <InputField
          width="95px"
          type="time"
          value={schedule.time}
          onChange={(value) => onChange?.({ time: value })}
          style={{ fontSize: '16px', color: '#f46767', fontWeight: 'bold' }}
        />
        <div ref={pickerRef} className={styles['schedule-row__picker-wrapper']}>
          <button
            type="button"
            className={styles['schedule-row__icon-button']}
            onClick={() => setShowPicker((prev) => !prev)}
          >
            {icon}
          </button>
          {showPicker && (
            <div className={styles['schedule-row__picker']}>
              <button
                type="button"
                className={`${styles['schedule-row__picker-item']} ${styles['schedule-row__picker-item--auto']}`}
                onClick={() => handlePickIcon('')}
              >
                авто
              </button>
              {EMOJI_CHOICES.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  className={styles['schedule-row__picker-item']}
                  onClick={() => handlePickIcon(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        <InputField
          value={schedule.activity}
          onChange={(value) => onChange?.({ activity: value })}
          style={{ fontSize: '16px', color: '#4a90be', fontWeight: 'bold' }}
        />

        <div className={styles['schedule-row__buttons']}>
          <ActionButton onClick={onAdd} type="ADD" />
          <ActionButton onClick={onDelete} type="DELETE" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles['schedule-row']} ${state ? styles[`schedule-row--${state}`] : ''}`}>
      <div className={styles['schedule-row__time']}>{schedule.time}</div>
      <div className={styles['schedule-row__rail']}>
        <div className={styles['schedule-row__dot']}></div>
      </div>
      <div className={styles['schedule-row__card']}>
        <div className={styles['schedule-row__emoji']}>{icon}</div>
        <div className={styles['schedule-row__text']}>
          <div className={styles['schedule-row__activity']}>{schedule.activity}</div>
          {isChatRoom && placeName && (
            <div className={styles['schedule-row__place']}>Место: {placeName}</div>
          )}
        </div>
      </div>
    </div>
  );
}
