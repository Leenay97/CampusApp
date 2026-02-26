import { JSX, memo } from 'react';
import { HeaderMenuOptions } from './constants';
import styles from './style.module.scss';
import Link from 'next/link';

type BurgerMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

function BurgerMenu({ isOpen, onClose }: BurgerMenuProps): JSX.Element {
  return (
    <div className={isOpen ? styles['burger-menu'] : styles['burger-menu--hidden']}>
      <nav className={styles['burger-menu__wrapper']}>
        {Object.values(HeaderMenuOptions).map((option) => (
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
