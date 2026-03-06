import { useMemo, useRef, useState } from 'react';
import styles from './style.module.scss';

type MultipleSelectProps<T> = {
  items: T[];
  value: T[];
  onChange: (value: T[]) => void;
};

export function MultipleSelect<
  T extends { id: string; name: string; russianName?: string; color?: string },
>({ items, value, onChange }: MultipleSelectProps<T>) {
  const [filterValue, setFilterValue] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(event.target.value);
  };

  const availableItems = useMemo(() => {
    return items
      .filter((item) => !value.some((v) => v.id === item.id))
      .filter((item) =>
        (item.russianName ?? item.name).toLowerCase().includes(filterValue.toLowerCase()),
      )
      .sort((a, b) => (a.russianName ?? a.name).localeCompare(b.russianName ?? b.name));
  }, [items, value, filterValue]);

  const handleSelect = (item: T) => {
    onChange([...value, item]);
    setFilterValue('');

    inputRef.current?.focus();
  };

  const handleRemove = (item: T) => {
    onChange(value.filter((v) => v.id !== item.id));
  };

  return (
    <div className={styles['multiple-select']}>
      <div className={styles['multiple-select__field']}>
        <div className={styles['multiple-select__input']}>
          <div className={styles['multiple-select__selected']}>
            {value.map((item) => (
              <div
                key={item.id}
                className={styles['multiple-select__item']}
                style={
                  item.color ? { backgroundColor: item.color, color: '#FFFFFF', border: 0 } : {}
                }
                onClick={() => handleRemove(item)}
              >
                {item.russianName ?? item.name}
              </div>
            ))}
          </div>

          <input
            value={filterValue}
            onChange={handleInputChange}
            className={styles['multiple-select__search']}
            ref={inputRef}
          />
        </div>
      </div>

      <div className={styles['multiple-select__options']}>
        {availableItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleSelect(item)}
            className={styles['multiple-select__item']}
            style={item.color ? { backgroundColor: item.color, color: '#FFFFFF', border: 0 } : {}}
          >
            {item.russianName ?? item.name}
          </div>
        ))}
      </div>
    </div>
  );
}
