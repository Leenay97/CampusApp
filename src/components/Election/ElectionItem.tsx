import { useEffect, useState } from 'react';
import { VoteOption } from '@/app/types';
import styles from './Election.module.scss';

const BLOCKED_FLASH_MS = 1400;

type Props = {
  option: VoteOption;
  voted?: boolean;
  adminMode?: boolean;
  showCount?: boolean;
  disabled?: boolean;
  finished?: boolean;
  isOwnGroup?: boolean;
  onClick?: () => void;
};
export default function ElectionItem({
  option,
  adminMode = false,
  showCount = false,
  voted = false,
  disabled = false,
  finished = false,
  isOwnGroup = false,
  onClick,
}: Props) {
  const [blocked, setBlocked] = useState(false);
  const clickable = Boolean(onClick) && !disabled && !isOwnGroup;
  const blockedClickable = Boolean(onClick) && !disabled && isOwnGroup;

  useEffect(() => {
    if (!blocked) return;
    const timer = setTimeout(() => setBlocked(false), BLOCKED_FLASH_MS);
    return () => clearTimeout(timer);
  }, [blocked]);

  function handleClick() {
    if (clickable) {
      onClick?.();
      return;
    }
    if (blockedClickable) {
      setBlocked(true);
    }
  }

  return (
    <div
      className={`${styles['item']} ${voted ? styles['item_voted'] : ''} ${clickable ? styles['item_clickable'] : ''} ${blocked ? styles['item_blocked'] : ''}`}
      onClick={clickable || blockedClickable ? handleClick : undefined}
      title={isOwnGroup ? 'Нельзя голосовать за свою группу' : undefined}
    >
      <span className={`${styles['item__fill']} ${voted ? styles['item__fill_active'] : ''}`} />
      <span className={styles['item__blockedFlash']} />
      <span className={styles['item__name']}>
        {option.name}
        {option.group && <span className={styles['item__group']}>{option.group.name}</span>}
      </span>
      {(adminMode || showCount) && (
        <span className={styles['item__count']}>{option.votesNumber}</span>
      )}
      {!adminMode && !finished && (
        <span className={`${styles['item__check']} ${voted ? styles['item__check_active'] : ''}`}>
          ✓
        </span>
      )}
    </div>
  );
}
