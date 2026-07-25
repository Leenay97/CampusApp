'use client';
import { memo, ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.scss';

type ModalProps = {
  onClose: () => void;
  isOpen?: boolean;
  children: ReactNode;
  className?: string;
};

function Modal({ onClose, children, className }: ModalProps) {
  const mouseDownOnOverlay = useRef(false);

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

  function handleOverlayMouseDown(e: React.MouseEvent) {
    mouseDownOnOverlay.current = e.target === e.currentTarget;
  }

  function handleOverlayClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (e.target === e.currentTarget && mouseDownOnOverlay.current) {
      onClose();
    }
    mouseDownOnOverlay.current = false;
  }

  function handleContentClick(e: React.MouseEvent) {
    e.stopPropagation();
  }

  return createPortal(
    <div
      className={styles['modal']}
      onMouseDown={handleOverlayMouseDown}
      onClick={handleOverlayClick}
    >
      <div className={`${styles['modal__content']} ${className}`} onClick={handleContentClick}>
        {children}
      </div>
    </div>,
    modalRoot,
  );
}

export default memo(Modal);
