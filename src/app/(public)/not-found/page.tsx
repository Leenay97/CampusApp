'use client';

import styles from './style.module.scss';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Seagull from '@/assets/img/seagull-top.png';

function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="fullscreen-container">
      <div className="centered-container">
        <div className={styles['not-found']}>
          <div className={styles['not-found__container']}>
            <Image className={styles['not-found__image']} src={Seagull} alt="404 Not Found" />
            <div className={styles['not-found__content']}>
              <h1 className="title">Кажется ты заблудился</h1>
              <h1 className="subtitle">Давай вернемся, откуда пришли</h1>
              <PrimaryButton onClick={() => router.push('/')}>Вернуться</PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
