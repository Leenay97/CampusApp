import { JSX, memo } from 'react';
import { HeaderMenuOptions } from './constants';
import styles from '@components/Header/style.module.scss';
import Link from 'next/link';

function HeaderMenu(): JSX.Element {
  return (
    <nav className={styles['header__menu']}>
      {Object.values(HeaderMenuOptions).map((option) => (
        <Link key={option.link} href={option.link} className={styles['header__menu-option']}>
          {option.name}
        </Link>
      ))}
    </nav>
  );
}

export default memo(HeaderMenu);
