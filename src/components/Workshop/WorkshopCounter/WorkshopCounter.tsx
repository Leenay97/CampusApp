import { WorkshopCounterProps } from '@components/Workshop/types';
import styles from './WorkshopCounter.module.scss';
import { memo } from 'react';

function WorkShopCounter({ number, maxNumber }: WorkshopCounterProps) {
  let percentage = (number / maxNumber) * 100;
  if (number >= maxNumber) {
    percentage = 100;
  }
  return (
    <div className={styles['workshop-counter']}>
      <div className={styles['workshop-counter__text']}>
        {number >= maxNumber ? maxNumber : number}/{maxNumber}
      </div>
      <div className={styles['workshop-counter__scale']} style={{ width: `${percentage}%` }}></div>
    </div>
  );
}

export default memo(WorkShopCounter);
