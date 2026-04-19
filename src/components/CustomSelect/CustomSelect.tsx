import { useState, useRef, useEffect } from 'react';
import styles from './style.module.scss';
import ChevronIcon from '@components/Icons/ChevronIcon/ChevronIcon';
import SearchIcon from '@components/Icons/SearchIcon/SearchIcon';
import CrossIcon from '../Icons/CrossIcon/CrossIcon';

type CustomSelectProps<T> = {
  items: T[];
  initValue?: string;
  width?: string;
  hasCleanButton?: boolean;
  onChange: (value: T) => void;
};

export function CustomSelect<T extends { id: string; name: string; russianName?: string }>({
  items,
  initValue,
  width,
  hasCleanButton,
  onChange,
}: CustomSelectProps<T>) {
  const [value, setValue] = useState<string>(initValue ?? '');
  const [filterValue, setFilterValue] = useState<string>('');
  const [showItems, setShowItems] = useState<boolean>(false);

  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setShowItems(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!items || !items.length) return null;

  const filteredItems = items.filter(
    (item) =>
      item?.name?.toLowerCase().includes(filterValue.toLowerCase()) ||
      item?.russianName?.toLowerCase().includes(filterValue.toLowerCase()),
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(event.target.value);
  };

  const handleItemSelect = (item: T) => {
    onChange(item);
    setValue(item?.name ?? item?.russianName ?? '');
    setShowItems(false);
  };

  function handleClean() {
    onChange({ id: '', name: '' });
    setValue('');
  }

  return (
    <div ref={selectRef} className={styles['custom-select']} style={{ width }}>
      <div className={styles['custom-select__input']} onClick={() => setShowItems(true)}>
        <span>{value}</span>
        <ChevronIcon isOpen={showItems} />
      </div>

      {showItems && (
        <ul className={styles['custom-select__list']}>
          <li key="input" className={styles['custom-select__option']}>
            <input
              className={styles['custom-select__input']}
              onChange={handleInputChange}
              value={filterValue}
            />
            {filterValue ? (
              <CrossIcon
                style={{ position: 'absolute', top: 17, right: 20, cursor: 'pointer' }}
                onClick={() => setFilterValue('')}
              />
            ) : (
              <SearchIcon style={{ position: 'absolute', top: 17, right: 20 }} />
            )}
          </li>

          {filteredItems.map((item) => (
            <li
              key={item.id}
              className={styles['custom-select__option']}
              onClick={() => handleItemSelect(item)}
            >
              {item.name ?? item.russianName}
            </li>
          ))}
        </ul>
      )}
      {hasCleanButton && (
        <CrossIcon
          style={{ position: 'absolute', top: 6, right: -20, cursor: 'pointer' }}
          onClick={handleClean}
        />
      )}
    </div>
  );
}
