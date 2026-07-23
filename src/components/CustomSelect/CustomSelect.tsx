import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './CustomSelect.module.scss';
import ChevronIcon from '@components/Icons/ChevronIcon/ChevronIcon';
import SearchIcon from '@components/Icons/SearchIcon/SearchIcon';
import CrossIcon from '../Icons/CrossIcon/CrossIcon';

const LIST_HEIGHT_ESTIMATE = 300;

type MenuPosition = {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
};

type CustomSelectProps<T> = {
  items: T[];
  initValue?: string;
  width?: string;
  placeholder?: string;
  hasCleanButton?: boolean;
  onChange: (value: T) => void;
};

export function CustomSelect<T extends { id: string; name: string; russianName?: string }>({
  items,
  initValue,
  width,
  placeholder,
  hasCleanButton,
  onChange,
}: CustomSelectProps<T>) {
  const [value, setValue] = useState<string>(initValue ?? '');
  const [filterValue, setFilterValue] = useState<string>('');
  const [showItems, setShowItems] = useState<boolean>(false);
  const [openUpward, setOpenUpward] = useState<boolean>(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  const selectRef = useRef<HTMLDivElement>(null);
  const inputBoxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isInsideSelect = selectRef.current && selectRef.current.contains(target);
      const isInsideList = listRef.current && listRef.current.contains(target);
      if (!isInsideSelect && !isInsideList) {
        setShowItems(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!showItems) return;
    function handleReposition(event: Event) {
      if (listRef.current && listRef.current.contains(event.target as Node)) {
        return;
      }
      setShowItems(false);
    }

    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);

    return () => {
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [showItems]);

  useEffect(() => {
    /*eslint-disable-next-line react-hooks/set-state-in-effect*/
    setValue(initValue ?? '');
  }, [initValue]);

  if (!items || !items.length) return null;

  const filteredItems = items.filter(
    (item) =>
      item?.name?.toLowerCase().includes(filterValue.toLowerCase()) ||
      item?.russianName?.toLowerCase().includes(filterValue.toLowerCase()),
  );

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFilterValue(event.target.value);
  }

  function handleItemSelect(item: T) {
    onChange(item);
    setValue(item?.name ?? item?.russianName ?? '');
    setFilterValue('');
    setShowItems(false);
  }

  function handleClean() {
    const emptyItem = items.find((item) => item.id === '') ?? ({ id: '', name: '' } as T);
    onChange(emptyItem);
    setValue('');
    setFilterValue('');
  }

  function handleToggleOpen() {
    if (!showItems && inputBoxRef.current) {
      const rect = inputBoxRef.current.getBoundingClientRect();
      const screenHeight = document.documentElement.clientHeight;
      const spaceBelow = screenHeight - rect.bottom;
      const shouldOpenUpward = spaceBelow < LIST_HEIGHT_ESTIMATE && rect.top > spaceBelow;

      setOpenUpward(shouldOpenUpward);
      setMenuPosition({
        left: rect.left,
        width: rect.width,
        ...(shouldOpenUpward ? { bottom: screenHeight - rect.top } : { top: rect.bottom }),
      });
    }
    setShowItems((prev) => !prev);
  }

  return (
    <div ref={selectRef} className={styles['custom-select']} style={{ width }}>
      <div
        ref={inputBoxRef}
        className={`${styles['custom-select__input']} ${showItems ? styles['custom-select__input--open'] : ''} ${showItems && openUpward ? styles['custom-select__input--open-up'] : ''}`}
        onClick={handleToggleOpen}
      >
        <span className={!value && placeholder ? styles['custom-select__placeholder'] : undefined}>
          {value || placeholder}
        </span>
        <ChevronIcon isOpen={showItems} />
      </div>

      {showItems &&
        menuPosition &&
        createPortal(
          (() => {
            const searchBox = (
              <div
                className={`${styles['custom-select__option']} ${styles['custom-select__search']}`}
              >
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
              </div>
            );

            const optionsList = (
              <ul className={styles['custom-select__options']}>
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
            );

            return (
              <div
                ref={listRef}
                className={`${styles['custom-select__list']} ${openUpward ? styles['custom-select__list--up'] : ''}`}
                style={{
                  left: menuPosition.left,
                  width: menuPosition.width,
                  top: menuPosition.top,
                  bottom: menuPosition.bottom,
                }}
              >
                {openUpward ? (
                  <>
                    {optionsList}
                    {searchBox}
                  </>
                ) : (
                  <>
                    {searchBox}
                    {optionsList}
                  </>
                )}
              </div>
            );
          })(),
          document.body,
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
