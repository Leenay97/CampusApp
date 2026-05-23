'use client';
import { Workshop as WorkshopType } from './types';
import styles from './Workshop.module.scss';
import { memo } from 'react';
import WorkshopCounter from './WorkshopCounter/WorkshopCounter';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@components/SecondaryButton/SecondaryButton';

function Workshop({
  name,
  teacher,
  avatar,
  joined,
  description,
  students,
  maxStudentAmount,
  maxAge,
  place,
  toClose,
  isClosed,
  isSport,
  noButtons,
  date,
  handleJoin,
}: WorkshopType) {
  const studentCount = students?.length ?? 0;
  const isFull = studentCount >= (maxStudentAmount ?? 0);

  console.log(date);

  if (isClosed) {
    return (
      <div className={styles['workshop--active']}>
        <div className={styles['workshop__name']}>{name}</div>
        <div className={styles['workshop__teacher']}>
          <div className={styles['teacher-photo']} />
          {teacher}
        </div>
        <WorkshopCounter number={studentCount} maxNumber={maxStudentAmount} />
        <SecondaryButton disabled>Мастеркласс закрыт</SecondaryButton>
      </div>
    );
  }

  return (
    <div className={joined ? styles['workshop--active'] : styles['workshop']}>
      <div className={styles['workshop__name']}>{name}</div>
      {place && <div className={styles['workshop__place']}>{place}</div>}
      {description && <div className={styles['workshop__description']}>{description}</div>}
      <div className={styles['workshop__teacher']}>
        <div
          className={styles['teacher-photo']}
          style={{
            backgroundImage: avatar ? `url(${process.env.NEXT_PUBLIC_API_URL}${avatar})` : 'none',
          }}
        ></div>
        {teacher}
      </div>
      {Number(maxAge) > 0 && <div className={styles['workshop__place']}>Возраст: {maxAge}+</div>}
      {!isSport && <WorkshopCounter number={studentCount} maxNumber={maxStudentAmount} />}
      {toClose && date && (
        <div className={styles['workshop__place']}>
          {new Date(Number(date)).toLocaleDateString()}
        </div>
      )}

      {!noButtons && (
        <>
          {joined ? (
            <SecondaryButton disabled={isFull && !toClose} onClick={handleJoin}>
              Отменить
            </SecondaryButton>
          ) : (
            <PrimaryButton disabled={isFull && !toClose} onClick={handleJoin}>
              {toClose ? 'Закрыть' : 'Записаться'}
            </PrimaryButton>
          )}
        </>
      )}
    </div>
  );
}

export default memo(Workshop);
