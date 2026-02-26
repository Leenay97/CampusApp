'use client';
import styles from './style.module.scss';

type PrimaryButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
};

function SecondaryButton({ children, onClick }: PrimaryButtonProps) {
  return (
    <button className={styles['secondary-button']} onClick={onClick}>
      {children}
    </button>
  );
}

export default SecondaryButton;
