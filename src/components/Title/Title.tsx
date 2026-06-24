import { ReactNode } from 'react';
import styles from './Title.module.scss';

type TitleProps = {
  children: ReactNode;
  noMargin?: boolean;
};

export default function Title({ children, noMargin }: TitleProps) {
  return <div className={noMargin ? styles['title--no-margin'] : styles['title']}>{children}</div>;
}
