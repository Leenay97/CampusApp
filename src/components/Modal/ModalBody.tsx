'use client';
import { memo, ReactNode } from 'react';
import styles from './Modal.module.scss';

type ModalBodyProps = {
  children: ReactNode;
  className?: string;
};

function ModalBody({ children, className }: ModalBodyProps) {
  return <div className={`${styles['modal__body']} ${className}`}>{children}</div>;
}

export default memo(ModalBody);
