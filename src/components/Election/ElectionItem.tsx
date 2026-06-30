import { VoteOption } from '@/app/types';
import styles from './Election.module.scss';

type Props = {
  option: VoteOption;
  voted?: boolean;
  adminMode?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};
export default function ElectionItem({
  option,
  adminMode = false,
  voted = false,
  disabled = false,
  onClick,
}: Props) {
  const clickable = Boolean(onClick) && !disabled;

  return (
    <div
      className={`${styles['item']} ${voted ? styles['item_voted'] : ''} ${clickable ? styles['item_clickable'] : ''}`}
      onClick={clickable ? onClick : undefined}
    >
      <span className={`${styles['item__fill']} ${voted ? styles['item__fill_active'] : ''}`} />
      <span className={styles['item__name']}>{option.name}</span>
      {adminMode && <span className={styles['item__count']}>{option.votesNumber}</span>}
      {!adminMode && (
        <span className={`${styles['item__check']} ${voted ? styles['item__check_active'] : ''}`}>
          ✓
        </span>
      )}
    </div>
  );
}
