'use client';
import { memo, ReactNode } from 'react';
import styles from './Modal.module.scss';

type ModalBodyProps = {
  children: ReactNode[];
};

function ModalBody({ children }: ModalBodyProps) {
  return <div className={styles['modal__body']}>{children}</div>;
}

export default memo(ModalBody);
