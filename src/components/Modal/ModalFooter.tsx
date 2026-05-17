'use client';
import { memo, ReactNode } from 'react';
import styles from './Modal.module.scss';

type ModalFooterProps = {
  children: ReactNode;
};

function Modal({ children }: ModalFooterProps) {
  return <div className={styles['modal__footer']}>{children}</div>;
}

export default memo(Modal);
