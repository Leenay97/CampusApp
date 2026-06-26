import { ReactNode } from 'react';
import styles from './Subtitle.module.scss';

type SubtitleProps = {
  children: ReactNode;
  noMargin?: boolean;
};

export default function Subtitle({ children, noMargin }: SubtitleProps) {
  return (
    <div className={noMargin ? styles['subtitle--no-margin'] : styles['subtitle']}>{children}</div>
  );
}
