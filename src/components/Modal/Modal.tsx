'use client';
import { memo, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.scss';

type ModalProps = {
  onClose: () => void;
  isOpen?: boolean;
  children: ReactNode;
  className?: string;
};

function Modal({ onClose, children, className }: ModalProps) {
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
      <div className={`${styles['modal__content']} ${className}`} onClick={handleContentClick}>
        {children}
      </div>
    </div>,
    modalRoot,
  );
}

export default memo(Modal);
