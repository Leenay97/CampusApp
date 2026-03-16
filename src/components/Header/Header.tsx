'use client';

import { memo, useEffect, useMemo, useState } from 'react';
import styles from './style.module.scss';
import { Burger } from '../Burger/Burger';
import BurgerMenu from '../BurgerMenu/BurgerMenu';
import Logo from '@/assets/img/logo.png';
import Image from 'next/image';
import { HeaderProfile } from './HeaderProfile/HeaderProfile';
import ProfileMenu from '../ProfileMenu/ProfileMenu';
import { useUser } from '@/contexts/UserContext';
import { useApp } from '@/contexts/AppContext';

function Header() {
  const [hasMenu, setHasMenu] = useState(false);
  const [isBurgerOpen, setIsBurgerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user } = useUser();
  const { app } = useApp();

  const userLevel = useMemo(() => {
    return user?.userLevel;
  }, [user?.userLevel]);

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

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      if (isBurgerOpen || isProfileOpen) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isBurgerOpen, isProfileOpen]);

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
        {isBurgerOpen && app?.todayPlace?.name ? (
          <div
            className={styles['header__place']}
            style={{ backgroundColor: app?.todayPlace?.color }}
          >
            {app?.todayPlace?.name}
          </div>
        ) : (
          <Image className={styles['header__logo']} src={Logo} alt="Logo" />
        )}
        <Burger isOpen={isBurgerOpen} onClick={handleBurgerClick} />
        <BurgerMenu userLevel={userLevel} isOpen={isBurgerOpen} onClose={handleBurgerClose} />
        <HeaderProfile user={user} isExpanded={hasMenu} onClick={handleProfileClick} />
        <ProfileMenu isOpen={isProfileOpen} onClose={handleProfileClose} />
      </div>
    </div>
  );
}

export default memo(Header);
