import { memo, useEffect, useState } from 'react';
import styles from './style.module.scss';
import Team from '@components/TeamRaiting/Team/Team';
import { Group } from '@/app/types';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import SecondaryButton from '../SecondaryButton/SecondaryButton';

type AddPointsProps = {
  groups: Group[];
  onSave: (changedGroups: Group[]) => void;
};

function AddPoints({ groups, onSave }: AddPointsProps) {
  const [changedGroups, setChangedGroups] = useState<Group[]>([]);

  useEffect(() => {
    if (Array.isArray(groups)) {
      const sorted = [...groups].sort((a, b) => b.points - a.points);

      /*eslint-disable react-hooks/set-state-in-effect*/
      setChangedGroups(sorted);
    }
  }, [groups]);

  function handleChange(groupId: string, amount: number) {
    setChangedGroups((prev) =>
      prev.map((group) =>
        group.id === groupId ? { ...group, points: (group.points ?? 0) + amount } : group,
      ),
    );
  }

  function handleSave() {
    onSave(changedGroups);
  }
  return (
    <div className="centered-container">
      <div className="section">
        <h1 className="title">Добавить очки</h1>
        <div className={styles['save-btn']}>
          <SecondaryButton onClick={handleSave}>Сохранить</SecondaryButton>
        </div>

        {changedGroups.map((team, index) => {
          const originalTeam = Array.isArray(groups)
            ? groups.find((g) => g.id === team.id)
            : undefined;
          const changedPoints = team.points - (originalTeam?.points ?? 0);

          return (
            <div key={team.id} className={styles['team']}>
              <Team team={team} place={index + 1} changedPoints={changedPoints} />
              <button className={styles['add-btn']} onClick={() => handleChange(team.id, -100)}>
                -100
              </button>
              <button className={styles['add-btn']} onClick={() => handleChange(team.id, 100)}>
                +100
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(AddPoints);
