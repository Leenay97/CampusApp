'use client';

import styles from './style.module.scss';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Seagull from '@/assets/img/seagull-top.png';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import FullscreenContainer from '@/components/FullscreenContainer/FullscreenContainer';
import Title from '@/components/Title/Title';
import Subtitle from '@/components/Subtitle/Subtitle';

function NotFoundPage() {
  const router = useRouter();

  return (
    <FullscreenContainer>
      <CenteredContainer>
        <div className={styles['not-found']}>
          <div className={styles['not-found__container']}>
            <Image className={styles['not-found__image']} src={Seagull} alt="404 Not Found" />
            <div className={styles['not-found__content']}>
              <Title>Кажется ты заблудился</Title>
              <Subtitle>Давай вернемся, откуда пришли</Subtitle>
              <PrimaryButton onClick={() => router.push('/')}>Вернуться</PrimaryButton>
            </div>
          </div>
        </div>
      </CenteredContainer>
    </FullscreenContainer>
  );
}

export default NotFoundPage;
