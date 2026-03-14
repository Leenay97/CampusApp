'use client';
import { memo, useMemo } from 'react';
import { createPortal } from 'react-dom';
import styles from './style.module.scss';
import { LoadingType } from '@/app/types';
import Loader from '../Loader/Loaader';
import Subtitle from '../Subtitle/Subtitle';

type ModalLoadingProps = {
  text?: string;
  onClose: () => void;
  loadingState: LoadingType;
};

function ModalLoading({ onClose, loadingState }: ModalLoadingProps) {
  const statusText = useMemo(() => {
    switch (loadingState) {
      case 'ERROR':
        return 'Упс, что-то не так';
      case 'SUCCESS':
        return 'Получилось!';
      case 'LOADING':
        return 'Немного подожди...';
    }
  }, [loadingState]);

  if (typeof window === 'undefined') return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return createPortal(
    <div className={styles['modal']}>
      <div className={styles['modal__content']}>
        <Loader />
        <Subtitle noMargin>{statusText}</Subtitle>
      </div>
    </div>,
    modalRoot,
  );
}

export default memo(ModalLoading);
