import { memo } from 'react';
import styles from './style.module.scss';

type TeamProps = {
  team: Team;
  place?: number;
  changedPoints?: number;
};

function Team({ team, place, changedPoints }: TeamProps) {
  const originalPoints = team.points - (changedPoints ?? 0);

  return (
    <div className={`${styles['team']} ${place ? styles[`team--${place}`] : ''}`}>
      <div className={styles['team__place']}>{place}</div>
      <div className={styles['team__name']}>{team.name}</div>
      <div className={styles['team__points']}>
        <span>{originalPoints}</span>
        {changedPoints !== 0 && changedPoints !== undefined && (
          <span className={styles['team__add-points']}> + {changedPoints}</span>
        )}
      </div>
    </div>
  );
}

export default memo(Team);
