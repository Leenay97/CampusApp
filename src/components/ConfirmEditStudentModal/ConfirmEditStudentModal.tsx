import { memo } from 'react';
import Modal from '../Modal/Modal';
import ModalHeader from '../Modal/ModalHeader';
import ModalBody from '../Modal/ModalBody';
import ModalFooter from '../Modal/ModalFooter';
import SecondaryButton from '../SecondaryButton/SecondaryButton';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import styles from './ConfirmEditStudentModal.module.scss';

export type FieldDiff = {
  label: string;
  oldValue: string;
  newValue: string;
};

type ConfirmEditStudentModalProps = {
  studentName: string;
  fields: FieldDiff[];
  onConfirm: () => void;
  onBack: () => void;
};

function ConfirmEditStudentModal({
  studentName,
  fields,
  onConfirm,
  onBack,
}: ConfirmEditStudentModalProps) {
  return (
    <Modal onClose={onBack}>
      <ModalHeader title={`Подтвердите изменения: ${studentName}`} onClose={onBack} />
      <ModalBody className={styles['modal-body']}>
        {fields.map((field) => {
          const changed = field.oldValue !== field.newValue;
          return (
            <div key={field.label} className={styles['row']}>
              <span className={styles['label']}>{field.label}</span>
              {changed ? (
                <span className={styles['value--changed']}>
                  <span className={styles['old-value']}>{field.oldValue || '—'}</span>
                  <span className={styles['arrow']}>→</span>
                  <span>{field.newValue || '—'}</span>
                </span>
              ) : (
                <span className={styles['value']}>{field.newValue || '—'}</span>
              )}
            </div>
          );
        })}
      </ModalBody>
      <ModalFooter>
        <SecondaryButton onClick={onBack}>Назад</SecondaryButton>
        <PrimaryButton onClick={onConfirm}>Сохранить</PrimaryButton>
      </ModalFooter>
    </Modal>
  );
}

export default memo(ConfirmEditStudentModal);
