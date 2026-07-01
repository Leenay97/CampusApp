'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import styles from './Header.module.scss';
import { Burger } from '../Burger/Burger';
import BurgerMenu from '../BurgerMenu/BurgerMenu';
import Logo from '@/assets/img/logo.png';
import Image from 'next/image';
import { HeaderProfile } from './HeaderProfile/HeaderProfile';
import ProfileMenu from '../ProfileMenu/ProfileMenu';
import { useUser } from '@/contexts/UserContext';
import { useApp } from '@/contexts/AppContext';

function Header() {
  const [isBurgerOpen, setIsBurgerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { user } = useUser();
  const { app } = useApp();
  const headerRef = useRef<HTMLDivElement>(null);

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

  function handleLogoClick() {
    if (location.pathname !== '/') {
      window.location.href = '/';
    }
  }

  useEffect(() => {
    let lastY = window.scrollY;

    function handleScroll() {
      const currentY = window.scrollY;

      if (!isBurgerOpen && !isProfileOpen) {
        setIsVisible(!(currentY > lastY && currentY > 50));
      }

      lastY = currentY;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isBurgerOpen, isProfileOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        (isBurgerOpen || isProfileOpen) &&
        headerRef.current &&
        !headerRef.current.contains(target)
      ) {
        setIsBurgerOpen(false);
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isBurgerOpen, isProfileOpen]);

  useEffect(() => {
    function checkWidth() {
      setIsBurgerOpen(false);
      setIsProfileOpen(false);
    }

    checkWidth();
    window.addEventListener('resize', checkWidth);

    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isBurgerOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isBurgerOpen]);

  return (
    <div className={`${styles['header']} ${!isVisible ? styles['header--hidden'] : ''}`}>
      <div
        ref={headerRef}
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
          <Image
            className={styles['header__logo']}
            src={Logo}
            alt="Logo"
            onClick={handleLogoClick}
          />
        )}
        <Burger isOpen={isBurgerOpen} onClick={handleBurgerClick} />
        <BurgerMenu userLevel={userLevel} isOpen={isBurgerOpen} onClose={handleBurgerClose} />
        <div className={styles['header__actions']}>
          <HeaderProfile user={user} onClick={handleProfileClick} />
        </div>
        <ProfileMenu isOpen={isProfileOpen} onClose={handleProfileClose} />
      </div>
    </div>
  );
}

export default memo(Header);
