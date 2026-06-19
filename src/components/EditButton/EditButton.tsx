'use client';
import EditIcon from '@/modules/icons/EditIcon';
import styles from './EditButton.module.scss';

type EditButtonProps = {
  size?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  onClick?: () => void;
};

function EditButton({ size, type, className, disabled = false, onClick }: EditButtonProps) {
  return (
    <button
      type={type}
      className={`${styles['edit-button']} ${className}`}
      onClick={onClick}
      style={{ width: size, height: size }}
      disabled={disabled}
    >
      <EditIcon width={20} height={20} stroke="currentColor" />
    </button>
  );
}

export default EditButton;
