'use client';

import { memo, useEffect, useState } from 'react';
import HeaderMenu from './HeaderMenu/HeaderMenu';
import styles from './style.module.scss';
import { Burger } from '../Burger/Burger';
import BurgerMenu from '../BurgerMenu/BurgerMenu';
import Logo from '@/assets/img/logo.png';
import Image from 'next/image';

function Header() {
  const [hasMenu, setHasMenu] = useState(false);
  const [isBurgerOpen, setIsBurgerOpen] = useState(false);

  function handleBurgerClick() {
    setIsBurgerOpen((prev) => !prev);
  }

  function handleBurgerClose() {
    setIsBurgerOpen(false);
  }

  useEffect(() => {
    const checkWidth = () => setHasMenu(window.innerWidth > 1000);

    checkWidth();
    window.addEventListener('resize', checkWidth);

    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  return (
    <div className={styles['header']}>
      <div
        className={isBurgerOpen ? styles['header__container--white'] : styles['header__container']}
      >
        <Image className={styles['header__logo']} src={Logo} alt="Logo" />
        <Burger isOpen={isBurgerOpen} onClick={handleBurgerClick} />
        <BurgerMenu isOpen={isBurgerOpen} onClose={handleBurgerClose} />
        <div className="header__profile"></div>
      </div>
    </div>
  );
}

export default memo(Header);
