'use client';
import { memo, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './CloseWorkshopModal.module.scss';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import Title from '../Title/Title';
import { User } from '@/app/types';
import Checkbox from '../Checkbox/Checkbox';

type ModalProps = {
  students: User[];
  onClose: () => void;
};

function CloseWorkshopModal({ students, onClose }: ModalProps) {
  const [checkedStudents, setCheckedStudents] = useState<string[]>(students.map((s) => s.id));
  if (typeof window === 'undefined') return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  function handleCheck(id: string) {
    setCheckedStudents((prev) => {
      if (checkedStudents.includes(id)) {
        return prev.filter((stud) => stud !== id);
      } else {
        return [...prev, id];
      }
    });
  }

  return createPortal(
    <div className={styles['modal']} onClick={handleOverlayClick}>
      <div className={styles['modal__content']} onClick={handleContentClick}>
        <div className={styles['modal__header']}>
          <Title>Ты точно хочешь завершить МК?</Title>
          <div className={styles['close-button']} onClick={onClose}>
            &times;
          </div>
        </div>
        <div className={styles['modal__body']}>
          {students?.map((student) => (
            <div key={student.id} className={styles['modal__row']}>
              <Checkbox
                label={student.name}
                checked={checkedStudents.includes(student.id)}
                onChange={() => handleCheck(student.id)}
              />
            </div>
          ))}
        </div>
        <div className={styles['modal__footer']}>
          <PrimaryButton onClick={() => {}}>Принять</PrimaryButton>
        </div>
      </div>
    </div>,
    modalRoot,
  );
}

export default memo(CloseWorkshopModal);
