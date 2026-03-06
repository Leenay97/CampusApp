import { JSX, memo } from 'react';
import { BurgerMenuOptions } from './constants';
import styles from './style.module.scss';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';

type ProfileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

function ProfileMenu({ isOpen, onClose }: ProfileMenuProps): JSX.Element {
  const { setUser } = useUser();
  function handleLogout() {
    onClose();
    setUser(null);
    localStorage.removeItem('token');
  }
  return (
    <div className={isOpen ? styles['profile-menu'] : styles['profile-menu--hidden']}>
      <nav className={styles['profile-menu__wrapper']}>
        {Object.values(BurgerMenuOptions).map((option) => (
          <Link
            key={option.link}
            href={option.link}
            className={styles['profile-menu__option']}
            onClick={option.link === '/login' ? handleLogout : onClose}
          >
            {option.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default memo(ProfileMenu);
