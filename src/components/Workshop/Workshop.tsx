'use client';
import { Workshop } from './types';
import styles from './style.module.scss';
import { memo } from 'react';
import WorkshopCounter from './WorkshopCounter/WorkshopCounter';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@components/SecondaryButton/SecondaryButton';

function WorkShop({
  name,
  teacher,
  description,
  studentAmount,
  maxStudentAmount,
  place,
}: Workshop) {
  return (
    <div className={styles['workshop']}>
      <div className={styles['workshop__name']}>{name}</div>
      <div className={styles['workshop__place']}>{place}</div>
      {description ? <div className={styles['workshop__description']}>{description}</div> : null}
      <div className={styles['workshop__teacher']}>
        <div className={styles['teacher-photo']}></div>
        {teacher}
      </div>
      <WorkshopCounter number={studentAmount} maxNumber={maxStudentAmount} />
      <PrimaryButton
        onClick={() => {
          console.log('Записаться clicked');
        }}
      >
        Записаться
      </PrimaryButton>
      <SecondaryButton
        onClick={() => {
          console.log('Подробнее clicked');
        }}
      >
        Записать друга
      </SecondaryButton>
    </div>
  );
}

export default memo(WorkShop);
