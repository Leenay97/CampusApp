'use client';
import styles from './DeleteButton.module.scss';
import DeleteIcon from '@/modules/icons/DeleteIcon';

type DeleteButtonProps = {
  size?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  onClick?: () => void;
};

function DeleteButton({ size, type, className, disabled = false, onClick }: DeleteButtonProps) {
  return (
    <button
      type={type}
      className={`${styles['delete-button']} ${className}`}
      onClick={onClick}
      style={{ width: size, height: size }}
      disabled={disabled}
    >
      <DeleteIcon width={20} height={20} stroke="currentColor" />
    </button>
  );
}

export default DeleteButton;
