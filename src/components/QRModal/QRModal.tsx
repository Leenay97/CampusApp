'use client';
import { memo } from 'react';
import { createPortal } from 'react-dom';
import styles from './style.module.scss';
import { useUser } from '@/contexts/UserContext';
import { QRCodeCanvas } from 'qrcode.react';
import Subtitle from '../Subtitle/Subtitle';

type ModalProps = {
  onClose: () => void;
};

function QRModal({ onClose }: ModalProps) {
  const { user } = useUser();

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

  const qrValue = String(user?.id);

  return createPortal(
    <div className={styles['modal']} onClick={handleOverlayClick}>
      <div className={styles['modal__content']} onClick={handleContentClick}>
        <div className={styles['modal__header']}>
          <Subtitle>Мой QR</Subtitle>
          <div className={styles['close-button']} onClick={onClose}>
            &times;
          </div>
        </div>
        <div className={styles['modal__body']}>
          {' '}
          <QRCodeCanvas value={qrValue} size={200} />
        </div>
      </div>
    </div>,
    modalRoot,
  );
}

export default memo(QRModal);
