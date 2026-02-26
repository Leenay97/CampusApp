import { memo } from 'react';
import styles from './style.module.scss';

type TeamProps = {
  team: Team;
  place?: number;
  width?: number;
};

function Team({ team, place, width }: TeamProps) {
  const maxWidth = 700;
  const widthValue = width !== undefined ? `${width}%` : '100%';

  return (
    <div
      className={`${styles['team']} ${place ? styles[`team--${place}`] : ''}`}
      style={{ width: `${width}%` }}
    >
      <div className={styles['team__place']}>{place}</div>
      <div className={styles['team__name']}>{team.name}</div>
      <div className={styles['team__points']}>{team.points}</div>
    </div>
  );
}

export default memo(Team);
