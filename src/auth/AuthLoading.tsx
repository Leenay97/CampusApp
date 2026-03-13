'use client';
import Image from 'next/image';
import Logo from '@/assets/img/logo.png';
import styles from './style.module.scss';
import { JSX } from 'react';
import FullscreenContainer from '@/components/FullscreenContainer/FullscreenContainer';

export default function AuthLoading(): JSX.Element {
  return (
    <FullscreenContainer>
      <div className={styles['loading-wrapper']}>
        <Image src={Logo} alt="Loading..." width={200} />
        <div className={styles['progress-bar']}>
          <div className={styles['progress-fill']} />
        </div>
      </div>
    </FullscreenContainer>
  );
}
