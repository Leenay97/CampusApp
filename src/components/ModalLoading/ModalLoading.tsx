'use client';
import { memo, useMemo } from 'react';
import { createPortal } from 'react-dom';
import styles from './style.module.scss';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import { LoadingType } from '@/app/types';
import Waiting from '@/assets/img/waiting.gif';
import Image from 'next/image';
import Title from '../Title/Title';

type ModalLoadingProps = {
  text?: string;
  onClose: () => void;
  loadingState: LoadingType;
};

function ModalLoading({ onClose, loadingState }: ModalLoadingProps) {
  const statusText = useMemo(() => {
    switch (loadingState) {
      case 'ERROR':
        return 'Не получилось :(';
      case 'SUCCESS':
        return 'Получилось!';
      case 'LOADING':
        return 'Немного подождите...';
    }
  }, [loadingState]);

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
          <Title>Идет загрузка</Title>
          <div className={styles['close-button']} onClick={onClose}>
            &times;
          </div>
        </div>
        <div className={styles['modal__body']}>
          <Image src={Waiting} alt="wait" />
        </div>
        <div className={styles['modal__footer']}>
          <PrimaryButton disabled={loadingState === 'LOADING'} onClick={onClose}>
            {statusText}
          </PrimaryButton>
        </div>
      </div>
    </div>,
    modalRoot,
  );
}

export default memo(ModalLoading);
