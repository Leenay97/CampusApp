'use client';
import { Workshop as WorkshopType } from './types';
import styles from './style.module.scss';
import { memo } from 'react';
import WorkshopCounter from './WorkshopCounter/WorkshopCounter';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@components/SecondaryButton/SecondaryButton';

function Workshop({
  name,
  teacher,
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
  handleJoin,
}: WorkshopType) {
  const studentCount = students?.length ?? 0;
  const isFull = studentCount >= (maxStudentAmount ?? 0);

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

  console.log(maxAge);

  return (
    <div className={joined ? styles['workshop--active'] : styles['workshop']}>
      <div className={styles['workshop__name']}>{name}</div>
      {place && <div className={styles['workshop__place']}>{place}</div>}
      {description && <div className={styles['workshop__description']}>{description}</div>}
      <div className={styles['workshop__teacher']}>
        <div className={styles['teacher-photo']} />
        {teacher}
      </div>
      {Number(maxAge) > 0 && <div className={styles['workshop__place']}>Возраст: {maxAge}+</div>}
      {!isSport && <WorkshopCounter number={studentCount} maxNumber={maxStudentAmount} />}

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
