import { ReactNode } from 'react';
import styles from './CenteredContainer.module.scss';

type SectionProps = {
  wide?: boolean;
  noPadding?: boolean;
  children: ReactNode;
};
type StyleType = {
  maxWidth?: string;
  padding?: string;
};

export default function CenteredContainer({ children, noPadding, wide }: SectionProps) {
  const styleObj: StyleType = {};
  if (wide) {
    styleObj.maxWidth = '90vw';
  }
  if (noPadding) {
    styleObj.padding = '0';
  }

  return (
    <div className={styles['centered-container']} style={styleObj}>
      {children}
    </div>
  );
}
