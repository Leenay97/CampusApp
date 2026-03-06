import { useState, useRef, useEffect } from 'react';
import styles from './style.module.scss';
import { User } from '@/app/types';
import ChevronIcon from '@components/Icons/ChevronIcon/ChevronIcon';
import SearchIcon from '@components/Icons/SearchIcon/SearchIcon';
import CrossIcon from '../Icons/CrossIcon/CrossIcon';

type CustomSelectProps = {
  users: User[];
  isLoading: boolean;
  onChange: (value: User) => void;
};

export function UserCustomSelect({ users, isLoading, onChange }: CustomSelectProps) {
  const [value, setValue] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [showUsers, setShowUsers] = useState<boolean>(false);

  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setShowUsers(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!users || !users.length) return null;

  const filteredUsers = users.filter(
    (user) =>
      user?.name?.toLowerCase().includes(filterValue.toLowerCase()) ||
      user?.russianName?.toLowerCase().includes(filterValue.toLowerCase()),
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(event.target.value);
  };

  const handleUserSelect = (user: User) => {
    onChange(user);
    setValue(user?.name ?? user?.russianName ?? '');
    setShowUsers(false);
  };

  return (
    <div ref={selectRef} className={styles['custom-select']}>
      <div className={styles['custom-select__input']} onClick={() => setShowUsers(true)}>
        <span>{value}</span>
        <ChevronIcon isOpen={showUsers} />
      </div>

      {showUsers && (
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

          {filteredUsers.map((user) => (
            <li
              key={user.id}
              className={styles['custom-select__option']}
              onClick={() => handleUserSelect(user)}
            >
              {user.name ?? user.russianName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
