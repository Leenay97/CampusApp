import styles from './ActionButton.module.scss';

type ActionButtonProps = {
  type: 'ADD' | 'DELETE';
  onClick: () => void;
  title?: string;
};

export default function ActionButton({ type, title, onClick }: ActionButtonProps) {
  if (title) {
    return (
      <div className={styles['action-button__titled']} onClick={onClick}>
        {title}
        <button
          className={`${styles['action-button']} ${type === 'ADD' ? styles['action-button__add'] : styles['action-button__delete']}`}
        />
      </div>
    );
  }
  return (
    <button
      className={`${styles['action-button']} ${type === 'ADD' ? styles['action-button__add'] : styles['action-button__delete']}`}
      onClick={onClick}
    />
  );
}
