'use client';

import { memo, useEffect, useState } from 'react';
import styles from './style.module.scss';
import { Burger } from '../Burger/Burger';
import BurgerMenu from '../BurgerMenu/BurgerMenu';
import Logo from '@/assets/img/logo.png';
import Image from 'next/image';
import { HeaderProfile } from './HeaderProfile/HeaderProfile';
import ProfileMenu from '../ProfileMenu/ProfileMenu';
import { useUser } from '@/contexts/UserContext';

function Header() {
  const [hasMenu, setHasMenu] = useState(false);
  const [isBurgerOpen, setIsBurgerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user } = useUser();

  function handleBurgerClick() {
    setIsBurgerOpen((prev) => !prev);
    setIsProfileOpen(false);
  }

  function handleBurgerClose() {
    setIsBurgerOpen(false);
  }

  function handleProfileClick() {
    setIsProfileOpen((prev) => !prev);
    setIsBurgerOpen(false);
  }

  function handleProfileClose() {
    setIsProfileOpen(false);
  }

  // Обработчик скролла
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Определяем направление скролла
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Скролл вниз и прокрутили больше 50px - скрываем хедер
        setIsVisible(false);
      } else {
        // Скролл вверх - показываем хедер
        setIsVisible(true);
      }

      // Если открыто меню, не скрываем хедер
      if (isBurgerOpen || isProfileOpen) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isBurgerOpen, isProfileOpen]);

  // Проверка ширины экрана
  useEffect(() => {
    const checkWidth = () => {
      setHasMenu(window.innerWidth > 500);
      setIsBurgerOpen(false);
      setIsProfileOpen(false);
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);

    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  return (
    <div className={`${styles['header']} ${!isVisible ? styles['header--hidden'] : ''}`}>
      <div
        className={isBurgerOpen ? styles['header__container--white'] : styles['header__container']}
      >
        <Image className={styles['header__logo']} src={Logo} alt="Logo" />
        <Burger isOpen={isBurgerOpen} onClick={handleBurgerClick} />
        <BurgerMenu isOpen={isBurgerOpen} onClose={handleBurgerClose} />
        <HeaderProfile user={user} isExpanded={hasMenu} onClick={handleProfileClick} />
        <ProfileMenu isOpen={isProfileOpen} onClose={handleProfileClose} />
      </div>
    </div>
  );
}

export default memo(Header);
