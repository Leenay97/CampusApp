import styles from './UserBadge.module.scss';

type UserBadgeProps = {
  name: string;
  group?: string;
  onClick?: () => void;
};

export default function UserBadge({ name, group, onClick }: UserBadgeProps) {
  return (
    <div className={styles['user-badge']} onClick={onClick}>
      <div className={styles['user-badge__name']}>{name}</div>
      {<div className={styles['user-badge__group']}>{group ? group : 'Редактировать'}</div>}
    </div>
  );
}
