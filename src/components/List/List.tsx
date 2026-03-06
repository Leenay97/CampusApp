import styles from './style.module.scss';

type ListProps<T> = {
  items: T[];
  title?: string;
  isLoading: boolean;
  onDelete?: (item: T | null) => void;
};

export function List<
  T extends {
    id: string;
    name?: string;
    russianName?: string;
    isTeamPlace?: boolean;
    color?: string;
  },
>({ items, title, isLoading, onDelete }: ListProps<T>) {
  if (isLoading) {
    return <div className="section">Loading...</div>;
  }

  return (
    <div className="className">
      <h2 className="subtitle">{title}</h2>
      <ul className={styles['list']}>
        {items &&
          items.map((item) => (
            <li
              key={item.id}
              style={item.color ? { backgroundColor: item.color, color: '#FFFFFF' } : {}}
            >
              <div className={styles['list__item']}>{item.name ?? item.russianName}</div>
              {item.isTeamPlace && <span className={styles['list__item-tag']}>Team</span>}
              {onDelete && (
                <button className={styles['list__delete']} onClick={() => onDelete(item)}>
                  &times;
                </button>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
}
