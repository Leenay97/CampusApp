'use client';
import { memo, useState } from 'react';
import styles from './CloseWorkshopModal.module.scss';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import { User } from '@/app/types';
import Checkbox from '../Checkbox/Checkbox';
import Modal from '../Modal/Modal';
import ModalHeader from '../Modal/ModalHeader';
import ModalBody from '../Modal/ModalBody';
import ModalFooter from '../Modal/ModalFooter';

type ModalProps = {
  students: User[];
  onSubmit: (studentIds: string[]) => void;
  onClose: () => void;
};

function CloseWorkshopModal({ students, onSubmit, onClose }: ModalProps) {
  const [checkedStudents, setCheckedStudents] = useState<string[]>(students.map((s) => s.id));

  function handleCheck(id: string) {
    setCheckedStudents((prev) => {
      if (checkedStudents.includes(id)) {
        return prev.filter((stud) => stud !== id);
      } else {
        return [...prev, id];
      }
    });
  }

  function handleSubmit() {
    onSubmit(checkedStudents);
  }

  return (
    <Modal onClose={onClose}>
      <ModalHeader onClose={onClose} title="Закрыть МК" />
      <ModalBody>
        {students?.map((student) => (
          <div key={student.id} className={styles['modal__row']}>
            <Checkbox
              label={student.name}
              checked={checkedStudents.includes(student.id)}
              onChange={() => handleCheck(student.id)}
            />
          </div>
        ))}
      </ModalBody>
      <ModalFooter>
        <PrimaryButton onClick={handleSubmit}>Принять</PrimaryButton>
      </ModalFooter>
    </Modal>
  );
}

export default memo(CloseWorkshopModal);
