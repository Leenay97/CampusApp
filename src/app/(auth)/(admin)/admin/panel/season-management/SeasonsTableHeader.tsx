import { memo } from 'react';
import styles from './SeasonsPage.module.scss';

function SeasonsTableHeader() {
  return (
    <div className={styles['season-row']}>
      <div className={styles['season-row__item_header']}>Название</div>
      <div className={styles['season-row__item_header']}>Группы</div>
      <div className={styles['season-row__item_header']}>Учителя</div>
      <div className={styles['season-row__item_header']}></div>
    </div>
  );
}

export default memo(SeasonsTableHeader);
