import styles from './ActionButton.module.scss';

type ActionButtonProps = {
  type: 'ADD' | 'DELETE';
  onClick: () => void;
};

export default function ActionButton({ type, onClick }: ActionButtonProps) {
  return (
    <button
      className={`${styles['action-button']} ${type === 'ADD' ? styles['action-button__add'] : styles['action-button__delete']}`}
      onClick={onClick}
    />
  );
}
