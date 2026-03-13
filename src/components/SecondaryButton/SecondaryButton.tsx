'use client';
import styles from './style.module.scss';

type PrimaryButtonProps = {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
};

function SecondaryButton({ disabled, children, onClick }: PrimaryButtonProps) {
  return (
    <button disabled={disabled} className={styles['secondary-button']} onClick={onClick}>
      {children}
    </button>
  );
}

export default SecondaryButton;
