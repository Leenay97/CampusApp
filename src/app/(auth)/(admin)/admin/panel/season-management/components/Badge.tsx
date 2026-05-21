import styles from './Badge.module.scss';

type BadgeProps = {
  isActive?: boolean;
  isArchived?: boolean;
};

function Badge({ isActive, isArchived }: BadgeProps) {
  function getBadgeText() {
    if (isActive) return 'Active';
    if (isArchived) return 'Archived';
    return '';
  }

  function getBadgeClassName() {
    if (isActive) return styles['badge_active'];
    if (isArchived) return styles['badge_archived'];
    return '';
  }

  return <div className={`${styles['badge']} ${getBadgeClassName()}`}>{getBadgeText()}</div>;
}

export default Badge;
