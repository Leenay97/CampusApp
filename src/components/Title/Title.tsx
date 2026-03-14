import { ReactNode } from 'react';
import styles from './Title.module.scss';

export default function Title({ children, noMargin }: { children: ReactNode; noMargin?: boolean }) {
  return <div className={noMargin ? styles['title--no-margin'] : styles['title']}>{children}</div>;
}
