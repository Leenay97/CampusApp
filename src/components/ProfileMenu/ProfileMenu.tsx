import { JSX, memo } from 'react';
import { HeaderMenuOptions } from './constants';
import styles from './style.module.scss';
import Link from 'next/link';

type ProfileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

function ProfileMenu({ isOpen, onClose }: ProfileMenuProps): JSX.Element {
  function handleLogout() {
    localStorage.setItem('token', '');
    localStorage.setItem('user', '');
  }
  return (
    <div className={isOpen ? styles['profile-menu'] : styles['profile-menu--hidden']}>
      <nav className={styles['profile-menu__wrapper']}>
        {Object.values(HeaderMenuOptions).map((option) => (
          <Link
            key={option.link}
            href={option.link === 'logout' ? '/' : option.link}
            className={styles['profile-menu__option']}
            onClick={option.link === 'logout' ? handleLogout : onClose}
          >
            {option.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default memo(ProfileMenu);
