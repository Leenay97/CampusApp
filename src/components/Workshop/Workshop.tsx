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
  handleJoin,
}: WorkshopType) {
  if (isClosed) {
    return (
      <div className={styles['workshop--closed']}>
        <div className={styles['workshop__name']}>{name}</div>
        <div className={styles['workshop__teacher']}>
          <div className={styles['teacher-photo']}></div>
          {teacher}
        </div>
        <WorkshopCounter number={students?.length ?? 0} maxNumber={maxStudentAmount} />
        <SecondaryButton disabled>Мастеркласс закрыт</SecondaryButton>
      </div>
    );
  }
  if (joined) {
    return (
      <div className={styles['workshop--active']}>
        <div className={styles['workshop__name']}>{name}</div>
        <div className={styles['workshop__place']}>{place}</div>
        {description ? <div className={styles['workshop__description']}>{description}</div> : null}
        <div className={styles['workshop__teacher']}>
          <div className={styles['teacher-photo']}></div>
          {teacher}
        </div>
        {maxAge && <div className={styles['workshop__place']}>Возраст: {maxAge}+</div>}
        <WorkshopCounter number={students?.length ?? 0} maxNumber={maxStudentAmount} />
        <SecondaryButton
          disabled={students?.length >= maxStudentAmount && !toClose}
          onClick={handleJoin}
        >
          Отменить
        </SecondaryButton>
      </div>
    );
  }
  return (
    <div className={styles['workshop']}>
      <div className={styles['workshop__name']}>{name}</div>
      <div className={styles['workshop__place']}>{place}</div>
      {description ? <div className={styles['workshop__description']}>{description}</div> : null}
      <div className={styles['workshop__teacher']}>
        <div className={styles['teacher-photo']}></div>
        {teacher}
      </div>
      {maxAge && <div className={styles['workshop__place']}>Возраст: {maxAge}+</div>}
      <WorkshopCounter number={students?.length ?? 0} maxNumber={maxStudentAmount} />
      {toClose ? (
        <PrimaryButton
          disabled={students?.length >= maxStudentAmount && !toClose}
          onClick={handleJoin}
        >
          Закрыть
        </PrimaryButton>
      ) : (
        <PrimaryButton
          disabled={students?.length >= maxStudentAmount && !toClose}
          onClick={handleJoin}
        >
          Записаться
        </PrimaryButton>
      )}
    </div>
  );
}

export default memo(Workshop);
