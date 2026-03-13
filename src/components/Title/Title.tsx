import { ReactNode } from 'react';
import styles from './Title.module.scss';

export default function Title({ children }: { children: ReactNode }) {
  return <div className={styles['title']}>{children}</div>;
}
