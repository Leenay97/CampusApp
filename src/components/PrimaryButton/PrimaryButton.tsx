'use client';
import styles from './style.module.scss';

type PrimaryButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
};

function PrimaryButton({ children, onClick }: PrimaryButtonProps) {
  return (
    <button className={styles['primary-button']} onClick={onClick}>
      {children}
    </button>
  );
}

export default PrimaryButton;
