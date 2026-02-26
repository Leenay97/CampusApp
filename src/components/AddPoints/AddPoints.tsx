import { memo, useMemo } from 'react';
import styles from './style.module.scss';
import Team from '@components/TeamRaiting/Team/Team';

type AddPointsProps = {
  groups: Group[];
  onAdd: (id: string, amount: number) => void;
};

function AddPoints({ groups, onAdd }: AddPointsProps) {
  const sortedGroups = useMemo(() => {
    if (!groups) return [];
    return [...groups].sort((a, b) => b.points - a.points);
  }, [groups]);

  const maxPoints = useMemo(() => sortedGroups[0]?.points || 0, [sortedGroups]);

  return (
    <div className={styles['raiting']}>
      <h1 className={styles['title']}>Рейтинг команд</h1>
      {sortedGroups.map((team, index) => (
        <div key={team.name} className={styles['team']}>
          <Team
            key={team.name}
            team={team}
            place={index + 1}
            width={maxPoints > 0 ? (team.points / maxPoints) * 100 : 0}
          />
          <button
            className={styles['add-btn']}
            onClick={() => {
              onAdd(team.id, -100);
            }}
          >
            -100
          </button>
          <button
            className={styles['add-btn']}
            onClick={() => {
              onAdd(team.id, 100);
            }}
          >
            +100
          </button>
        </div>
      ))}
    </div>
  );
}

export default memo(AddPoints);
