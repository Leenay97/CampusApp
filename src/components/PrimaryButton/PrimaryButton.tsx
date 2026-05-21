'use client';
import styles from './PrimaryButton.module.scss';

type PrimaryButtonProps = {
  children: React.ReactNode;
  width?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string;
};

function PrimaryButton({
  children,
  width,
  type,
  className,
  disabled = false,
  onClick,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className={`${styles['primary-button']} ${className}`}
      onClick={onClick}
      style={{ width: width }}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default PrimaryButton;
