'use client';
import { memo } from 'react';
import { createPortal } from 'react-dom';
import styles from './MutationStatusToast.module.scss';
import { LoadingType } from '@/app/types';

type ToastState = 'LOADING' | 'SUCCESS' | 'ERROR';

const VARIANT_BY_STATE: Record<ToastState, string> = {
  LOADING: 'action',
  SUCCESS: 'success',
  ERROR: 'error',
};

const TEXT_BY_STATE: Record<ToastState, string> = {
  LOADING: 'Немного подожди...',
  SUCCESS: 'Получилось!',
  ERROR: 'Упс, что-то не так',
};

type MutationStatusToastProps = {
  loadingState: LoadingType | null;
};

function MutationStatusToast({ loadingState }: MutationStatusToastProps) {
  if (loadingState !== 'LOADING' && loadingState !== 'SUCCESS' && loadingState !== 'ERROR') {
    return null;
  }

  if (typeof window === 'undefined') return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  const variant = VARIANT_BY_STATE[loadingState];

  return createPortal(
    <div className={`${styles['toast']} ${styles[`toast--${variant}`]}`}>
      <p className={styles['toast__text']}>{TEXT_BY_STATE[loadingState]}</p>
    </div>,
    modalRoot,
  );
}

export default memo(MutationStatusToast);
