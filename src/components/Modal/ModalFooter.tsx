'use client';
import { memo } from 'react';
import styles from './Modal.module.scss';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@components/SecondaryButton/SecondaryButton';

type ModalFooterProps = {
  onSubmit: () => void;
  onClose: () => void;
  onCancel?: () => void;
  hasCancel?: boolean;
};

function Modal({ onSubmit, hasCancel, onCancel }: ModalFooterProps) {
  return (
    <div className={styles['modal__footer']}>
      {hasCancel && onCancel && <SecondaryButton onClick={onCancel}>Отмена</SecondaryButton>}
      <PrimaryButton onClick={onSubmit}>Принять</PrimaryButton>
    </div>
  );
}

export default memo(Modal);
