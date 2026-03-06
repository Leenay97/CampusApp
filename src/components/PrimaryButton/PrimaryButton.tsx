'use client';
import styles from './style.module.scss';

type PrimaryButtonProps = {
  children: React.ReactNode;
  width?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
};

function PrimaryButton({ children, width, type, disabled = false, onClick }: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className={styles['primary-button']}
      onClick={onClick}
      style={{ width: width }}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default PrimaryButton;
