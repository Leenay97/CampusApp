import { ReactNode } from 'react';
import styles from './FullscreenContainer.module.scss';

type SectionProps = {
  children: ReactNode;
};

export default function FullscreenContainer({ children }: SectionProps) {
  return <div className={styles['fullscreen-container']}>{children}</div>;
}
