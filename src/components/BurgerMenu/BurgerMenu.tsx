import { JSX, memo } from 'react';
import { getHeaderMenuOptions } from './constants';
import styles from './style.module.scss';
import Link from 'next/link';
import { UserLevel } from '@/app/types';

type BurgerMenuProps = {
  isOpen: boolean;
  userLevel?: UserLevel;
  onClose: () => void;
};

function BurgerMenu({ isOpen, userLevel, onClose }: BurgerMenuProps): JSX.Element {
  const options = getHeaderMenuOptions(userLevel ?? UserLevel.Student);
  return (
    <div className={isOpen ? styles['burger-menu'] : styles['burger-menu--hidden']}>
      <nav className={styles['burger-menu__wrapper']}>
        {options?.map((option) => (
          <Link
            key={option.link}
            href={option.link}
            className={styles['burger-menu__option']}
            onClick={onClose}
          >
            {option.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default memo(BurgerMenu);
