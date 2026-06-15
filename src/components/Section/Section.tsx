import { ReactNode } from 'react';
import styles from './Section.module.scss';

type SectionProps = {
  children: ReactNode;
  className?: string;
};

export default function Section({ children, className }: SectionProps) {
  return <div className={`${styles['section']} ${className}`}>{children}</div>;
}
