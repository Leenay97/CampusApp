import { useMemo } from 'react';
import styles from './style.module.scss';

type GroupsListProps = {
  groups: Group[];
  onDelete: (id: string, name: string) => void;
};

export function GroupsList({ groups, onDelete }: GroupsListProps) {
  const sortedGroups = useMemo(() => {
    if (!Array.isArray(groups)) return [];
    return [...groups].sort((a, b) => a.name.localeCompare(b.name));
  }, [groups]);

  if (!sortedGroups.length) return;

  return (
    <div className="className">
      <h2 className="subtitle">Список групп</h2>
      <ul className={styles['groups-list']}>
        {sortedGroups &&
          sortedGroups.map((group) => (
            <li key={group.id} className={styles['groups-list__item']}>
              <div className={styles['groups-list__group']}>{group.name}</div>
              <button
                className={styles['groups-list__delete']}
                onClick={() => onDelete(group.id, group.name)}
              >
                &times;
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
}
