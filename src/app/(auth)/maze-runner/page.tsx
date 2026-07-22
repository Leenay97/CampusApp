'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import queries from '@/graphql/queries';
import mutations from '@/graphql/mutations';
import { useUser } from '@/contexts/UserContext';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Section from '@/components/Section/Section';
import Title from '@/components/Title/Title';
import Subtitle from '@/components/Subtitle/Subtitle';
import Loader from '@/components/Loader/Loaader';
import MazeRunnerCodeInput from '@/components/MazeRunnerCodeInput/MazeRunnerCodeInput';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import { MazeRunnerStatus, UserLevel } from '@/app/types';
import styles from './MazeRunnerPage.module.scss';

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function MazeRunnerPage() {
  const { user } = useUser();
  const isTeacher = user?.userLevel === UserLevel.Teacher;
  const [now, setNow] = useState(() => Date.now());
  const [code, setCode] = useState('');

  const { data, loading, refetch } = useQuery(queries.GET_MAZE_RUNNER_STATUS, {
    fetchPolicy: 'network-only',
  });
  const status: MazeRunnerStatus | undefined = data?.mazeRunnerStatus;

  const [submitCode] = useGlobalLoadingMutation(mutations.SUBMIT_MAZE_RUNNER_CODE, {
    onCompleted: () => refetch(),
  });

  const lockedUntilMs = status?.lockedUntil ? new Date(status.lockedUntil).getTime() : null;
  const isLocked = Boolean(lockedUntilMs && lockedUntilMs > now);

  // Пока группа ещё не решила — подтягиваем статус на случай, если код ввёл
  // другой участник группы с другого устройства
  useEffect(() => {
    if (!status || status.isSolved) return;
    const interval = setInterval(() => refetch(), 4000);
    return () => clearInterval(interval);
  }, [status, refetch]);

  useEffect(() => {
    if (!isLocked) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isLocked]);

  useEffect(() => {
    if (lockedUntilMs && lockedUntilMs <= now) refetch();
  }, [now, lockedUntilMs, refetch]);

  async function handleCheck() {
    try {
      await submitCode({ code });
    } catch (err) {
      console.error(err);
    }
  }

  if (loading && !data) {
    return (
      <CenteredContainer>
        <Section>
          <Loader />
        </Section>
      </CenteredContainer>
    );
  }

  if (!status?.isActive) {
    return (
      <CenteredContainer>
        <Section>
          <Title noMargin>Maze Runner</Title>
          <div>Ивент сейчас не запущен</div>
        </Section>
      </CenteredContainer>
    );
  }

  const secondsLeft = lockedUntilMs ? Math.max(0, Math.ceil((lockedUntilMs - now) / 1000)) : 0;

  return (
    <CenteredContainer>
      <Section>
        <Title noMargin>Maze Runner</Title>

        {status.isSolved ? (
          <div className={styles['maze-runner__success']}>
            <div className={styles['maze-runner__title']}>Разгадано! Кодовое слово:</div>
            <div className={styles['maze-runner__codeword']}>{status.codeword}</div>
          </div>
        ) : isLocked ? (
          <div className={styles['maze-runner__locked']}>
            Группа ввела неверный код — ввод заблокирован на {formatTime(secondsLeft)}
          </div>
        ) : isTeacher ? (
          <div>Группа вводит код ({status.codeLength} цифр)</div>
        ) : (
          status.codeLength && (
            <div className={styles['maze-runner__form']}>
              <MazeRunnerCodeInput length={status.codeLength} onChange={setCode} />
              <PrimaryButton disabled={code.length !== status.codeLength} onClick={handleCheck}>
                Проверить
              </PrimaryButton>
            </div>
          )
        )}
      </Section>
    </CenteredContainer>
  );
}
