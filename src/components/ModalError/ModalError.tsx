'use client';
import { memo, useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './style.module.scss';

type ModalProps = {
  text: string;
  isOpen: boolean;
  onClose?: () => void;
};

function ModalError({ text, isOpen, onClose }: ModalProps) {
  useEffect(() => {
    if (!text) return;

    const timer = setTimeout(() => {
      onClose?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [text, onClose]);

  if (!isOpen) return null;

  if (typeof window === 'undefined') return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return createPortal(
    <div
      className={isOpen ? styles['modal-error'] : styles['modal-error--hidden']}
      onClick={onClose}
    >
      <p className={styles['modal-error__text']}>{text}</p>
    </div>,
    modalRoot,
  );
}

export default memo(ModalError);
