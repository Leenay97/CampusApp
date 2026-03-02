'use client';
import styles from './style.module.scss';

type PrimaryButtonProps = {
  children: React.ReactNode;
  width?: string;
  onClick: () => void;
};

function PrimaryButton({ children, width, onClick }: PrimaryButtonProps) {
  return (
    <button className={styles['primary-button']} onClick={onClick} style={{ width: width }}>
      {children}
    </button>
  );
}

export default PrimaryButton;
