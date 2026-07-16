import styles from './UserBadge.module.scss';

type UserBadgeProps = {
  name: string;
  secondName?: string;
  group?: string;
  isUnregistered?: boolean;
  onClick?: () => void;
};

export default function UserBadge({
  name,
  secondName,
  group,
  isUnregistered,
  onClick,
}: UserBadgeProps) {
  return (
    <div
      className={`${styles['user-badge']} ${isUnregistered ? styles['user-badge--unregistered'] : ''}`}
      onClick={isUnregistered ? undefined : onClick}
    >
      <div className={styles['user-badge__name']}>{name}</div>
      {secondName && <div className={styles['user-badge__name']}>{secondName}</div>}
      <div className={styles['user-badge__group']}>
        {isUnregistered ? 'Не зарегистрирован(а)' : group || 'Редактировать'}
      </div>
    </div>
  );
}
