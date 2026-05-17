'use client';
import { memo } from 'react';
import styles from './Modal.module.scss';
import Title from '../Title/Title';

type ModalHeaderProps = {
  title: string;
  onClose: () => void;
};

function ModalHeader({ title, onClose }: ModalHeaderProps) {
  if (typeof window === 'undefined') return null;

  return (
    <div className={styles['modal__header']}>
      <Title>{title}</Title>
      <div className={styles['close-button']} onClick={onClose}>
        &times;
      </div>
    </div>
  );
}

export default memo(ModalHeader);
