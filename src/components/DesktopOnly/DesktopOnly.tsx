import { ReactNode } from 'react';
import styles from './DesktopOnly.module.scss';

type DesktopOnlyProps = {
  children: ReactNode;
  message?: string;
};

export default function DesktopOnly({
  children,
  message = 'Доступно только в десктопной версии',
}: DesktopOnlyProps) {
  return (
    <>
      <div className={styles['banner']}>🖥 {message}</div>
      <div className={styles['content']}>{children}</div>
    </>
  );
}
