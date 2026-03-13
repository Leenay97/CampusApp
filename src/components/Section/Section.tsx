import { ReactNode } from 'react';
import styles from './Section.module.scss';

type SectionProps = {
  children: ReactNode;
};

export default function Section({ children }: SectionProps) {
  return <div className={styles['section']}>{children}</div>;
}
