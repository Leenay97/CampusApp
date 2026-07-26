'use client';
import { memo, useState } from 'react';
import styles from './CloseLessonModal.module.scss';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import { User } from '@/app/types';
import Checkbox from '../Checkbox/Checkbox';
import Modal from '../Modal/Modal';
import ModalHeader from '../Modal/ModalHeader';
import ModalBody from '../Modal/ModalBody';
import ModalFooter from '../Modal/ModalFooter';
import Subtitle from '../Subtitle/Subtitle';

type DateOption = {
  value: string;
  label: string;
  // Урок за эту дату уже закрыт: дату показываем, но выбрать нельзя
  disabled?: boolean;
};

type ModalProps = {
  students: User[];
  title?: string;
  dateOptions?: DateOption[];
  onSubmit: (studentIds: string[], date?: string) => void;
  onClose: () => void;
};

function CloseLessonModal({
  students,
  title = 'Завершить урок',
  dateOptions,
  onSubmit,
  onClose,
}: ModalProps) {
  const [checkedStudents, setCheckedStudents] = useState<string[]>(students.map((s) => s.id));
  const [selectedDate, setSelectedDate] = useState<string>(
    dateOptions?.find((option) => !option.disabled)?.value ?? '',
  );

  function handleCheck(id: string) {
    setCheckedStudents((prev) => {
      if (prev.includes(id)) {
        return prev.filter((stud) => stud !== id);
      } else {
        return [...prev, id];
      }
    });
  }

  function handleSubmit() {
    onSubmit(checkedStudents, selectedDate || undefined);
  }

  return (
    <Modal onClose={onClose}>
      <ModalHeader onClose={onClose} title={title} />
      <ModalBody className={styles['close-lesson-modal']}>
        {dateOptions && dateOptions.length > 0 && (
          <div className={styles['close-lesson-modal__dates']}>
            {dateOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                className={`${styles['close-lesson-modal__date']} ${option.value === selectedDate ? styles['close-lesson-modal__date--active'] : ''}`}
                onClick={() => setSelectedDate(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
        <Subtitle noMargin>Убедись, что это верный урок</Subtitle>
        {students?.map((student) => (
          <div key={student.id} className={styles['close-lesson-modal__row']}>
            <Checkbox
              label={student.name}
              checked={checkedStudents.includes(student.id)}
              onChange={() => handleCheck(student.id)}
            />
          </div>
        ))}
      </ModalBody>
      <ModalFooter>
        <PrimaryButton disabled={Boolean(dateOptions) && !selectedDate} onClick={handleSubmit}>
          Принять
        </PrimaryButton>
      </ModalFooter>
    </Modal>
  );
}

export default memo(CloseLessonModal);
