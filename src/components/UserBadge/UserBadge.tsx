import styles from './UserBadge.module.scss';

type UserBadgeProps = {
  name: string;
  secondName?: string;
  group?: string;
  onClick?: () => void;
};

export default function UserBadge({ name, secondName, group, onClick }: UserBadgeProps) {
  return (
    <div className={styles['user-badge']} onClick={onClick}>
      <div className={styles['user-badge__name']}>{name}</div>
      {secondName && <div className={styles['user-badge__name']}>{secondName}</div>}
      {<div className={styles['user-badge__group']}>{group ? group : 'Редактировать'}</div>}
    </div>
  );
}
