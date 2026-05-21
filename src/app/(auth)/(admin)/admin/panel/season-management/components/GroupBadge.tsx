import styles from './Badge.module.scss';

type GroupBadgeProps = {
  name?: string;
  onClick?: () => void;
  add?: boolean;
};

function GroupBadge({ name, onClick, add }: GroupBadgeProps) {
  return (
    <div className={`${add ? styles['group-badge_add'] : styles['group-badge']}`} onClick={onClick}>
      {name}
    </div>
  );
}

export default GroupBadge;
