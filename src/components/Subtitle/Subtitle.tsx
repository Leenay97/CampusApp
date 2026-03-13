import { ReactNode } from 'react';
import styles from './Subtitle.module.scss';

export default function Subtitle({
  children,
  noMargin,
}: {
  children: ReactNode;
  noMargin?: boolean;
}) {
  return (
    <div className={noMargin ? styles['subtitle--no-margin'] : styles['subtitle']}>{children}</div>
  );
}
