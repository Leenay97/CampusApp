import styles from './UserBadge.module.scss';

type UserBadgeProps = {
  name: string;
  group: string;
  onClick?: () => void;
};

export default function UserBadge({ name, group }: UserBadgeProps) {
  return (
    <div className={styles['user-badge']}>
      <div className={styles['user-badge__name']}>{name}</div>
      <div className={styles['user-badge__group']}>{group}</div>
    </div>
  );
}
