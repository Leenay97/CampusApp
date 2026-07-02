import { memo, useEffect, useState } from 'react';
import styles from './AddRubbers.module.scss';
import Team from '@components/TeamRaiting/Team/Team';
import { Group } from '@/app/types';
import SecondaryButton from '../SecondaryButton/SecondaryButton';
import Section from '../Section/Section';
import Title from '../Title/Title';

type AddRubbersProps = {
  groups: Group[];
  onSave: (changedGroups: Group[]) => void;
};

function AddRubbers({ groups, onSave }: AddRubbersProps) {
  const [changedGroups, setChangedGroups] = useState<Group[]>([]);

  useEffect(() => {
    if (Array.isArray(groups)) {
      const sorted = [...groups].sort((a, b) => b.rubbers - a.rubbers);

      /*eslint-disable react-hooks/set-state-in-effect*/
      setChangedGroups(sorted);
    }
  }, [groups]);

  function handleChange(groupId: string, amount: number) {
    setChangedGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? { ...group, rubbers: Math.max(0, (group.rubbers ?? 0) + amount) }
          : group,
      ),
    );
  }

  function handleSave() {
    onSave(changedGroups);
  }
  return (
    <Section>
      <Title>Добавить резиночки</Title>
      <div className={styles['save-btn']}>
        <SecondaryButton onClick={handleSave}>Сохранить</SecondaryButton>
      </div>

      {changedGroups.map((team, index) => {
        const originalTeam = Array.isArray(groups)
          ? groups.find((g) => g.id === team.id)
          : undefined;
        const changedRubbers = (team.rubbers ?? 0) - (originalTeam?.rubbers ?? 0);

        return (
          <div key={team.id} className={styles['team']}>
            <Team team={team} mode="rubbers" place={index + 1} changedPoints={changedRubbers} />
            <button className={styles['add-btn']} onClick={() => handleChange(team.id, -1)}>
              -1
            </button>
            <button className={styles['add-btn']} onClick={() => handleChange(team.id, 1)}>
              +1
            </button>
          </div>
        );
      })}
    </Section>
  );
}

export default memo(AddRubbers);
