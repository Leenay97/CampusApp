import { WorkshopCounterProps } from '@components/Workshop/types';
import styles from './style.module.scss';
import { memo } from 'react';

function WorkShopCounter({ number, maxNumber }: WorkshopCounterProps) {
  const percentage = (number / maxNumber) * 100;
  return (
    <div className={styles['workshop-counter']}>
      <div className={styles['workshop-counter__text']}>
        {number}/{maxNumber}
      </div>
      <div className={styles['workshop-counter__scale']} style={{ width: `${percentage}%` }}></div>
    </div>
  );
}

export default memo(WorkShopCounter);
