import { useMemo } from 'react';
import styles from './style.module.scss';
import { GroupInput } from '@/app/types';
import Subtitle from '../Subtitle/Subtitle';

type GroupsListProps = {
  groups: GroupInput[];
  onDelete: (name: string) => void;
};

export function GroupsList({ groups, onDelete }: GroupsListProps) {
  const sortedGroups = useMemo(() => {
    if (!Array.isArray(groups)) return [];
    return [...groups].sort((a, b) => a.name.localeCompare(b.name));
  }, [groups]);

  if (!sortedGroups.length) return;

  return (
    <div className="className">
      <Subtitle>Список групп</Subtitle>
      <ul className={styles['groups-list']}>
        {sortedGroups &&
          sortedGroups.map((group) => (
            <li key={group.name} className={styles['groups-list__item']}>
              <div className={styles['groups-list__group']}>{group.name}</div>
              <button
                className={styles['groups-list__delete']}
                onClick={() => onDelete(group.name)}
              >
                &times;
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
}
