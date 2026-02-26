'use client';
import { memo } from 'react';
import { createPortal } from 'react-dom';
import styles from './style.module.scss';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@components/SecondaryButton/SecondaryButton';

type ModalProps = {
  text: string;
  description?: string;
  onSubmit: () => void;
  onClose: () => void;
  onCancel?: () => void;
  hasCancel?: boolean;
  isOpen: boolean;
};

function Modal({ text, description, onSubmit, onClose, hasCancel, onCancel, isOpen }: ModalProps) {
  if (!isOpen) return null;

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

  return createPortal(
    <div className={styles['modal']} onClick={handleOverlayClick}>
      <div className={styles['modal__content']} onClick={handleContentClick}>
        <div className={styles['modal__header']}>
          <h2 className="title" style={{ margin: '0' }}>
            {text}
          </h2>
          <div className={styles['close-button']} onClick={onClose}>
            &times;
          </div>
        </div>
        <div className={styles['modal__body']}>
          <p>{description}</p>
        </div>
        <div className={styles['modal__footer']}>
          {hasCancel && onCancel && <SecondaryButton onClick={onCancel}>Отмена</SecondaryButton>}
          <PrimaryButton onClick={onSubmit}>Принять</PrimaryButton>
        </div>
      </div>
    </div>,
    modalRoot,
  );
}

export default memo(Modal);
