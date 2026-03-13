import { ReactNode } from 'react';
import styles from './Subtitle.module.scss';

export default function Subtitle({ children }: { children: ReactNode }) {
  return <div className={styles['subtitle']}>{children}</div>;
}
