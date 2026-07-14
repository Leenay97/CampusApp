'use client';
import { memo, ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.scss';

type ModalProps = {
  onClose: () => void;
  isOpen?: boolean;
  children: ReactNode;
  className?: string;
};

function Modal({ onClose, children, className }: ModalProps) {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (typeof window === 'undefined') return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  function handleOverlayClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleContentClick(e: React.MouseEvent) {
    e.stopPropagation();
  }

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
