'use client';
import Image from 'next/image';
import Logo from '@/assets/img/logo.png';
import styles from './style.module.scss';
import { JSX } from 'react';

export default function AuthLoading(): JSX.Element {
  return (
    <div className="fullscreen-container">
      <div className={styles['loading-wrapper']}>
        <Image src={Logo} alt="Loading..." width={200} />
        <div className={styles['progress-bar']}>
          <div className={styles['progress-fill']} />
        </div>
      </div>
    </div>
  );
}
