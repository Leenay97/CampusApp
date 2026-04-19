import { InputField } from '@components/InputField/InputField';
import styles from './style.module.scss';
import Subtitle from '../Subtitle/Subtitle';

type AddSeasonProps = {
  year: string;
  number: string;
  startDate: string;
  endDate: string;
  onChange: (year: string, number: string, startDate: string, endDate: string) => void;
};

export function AddSeason({ year, number, startDate, endDate, onChange }: AddSeasonProps) {
  function handleChangeYear(value: string) {
    onChange(value, number, startDate, endDate);
  }

  function handleChangeNumber(value: string) {
    onChange(year, value, startDate, endDate);
  }

  function handleChangeStartDate(value: string) {
    onChange(year, number, value, endDate);
  }

  function handleChangeEndDate(value: string) {
    onChange(year, number, startDate, value);
  }

  return (
    <div className={styles['add-season']}>
      <div className={styles['add-season__input']}>
        <Subtitle noMargin>Год</Subtitle>
        <InputField
          value={year}
          width="80px"
          onChange={handleChangeYear}
          maxLength={4}
          placeholder={'Год'}
        />
        <Subtitle noMargin>Сезон</Subtitle>
        <InputField
          value={number}
          width="40px"
          maxLength={2}
          onChange={handleChangeNumber}
          placeholder="№"
        />
      </div>
      <div>
        <Subtitle>Начало</Subtitle>
        <InputField value={startDate} width="150px" type="date" onChange={handleChangeStartDate} />
      </div>
      <div>
        <Subtitle>Конец</Subtitle>
        <InputField value={endDate} width="150px" type="date" onChange={handleChangeEndDate} />
      </div>
    </div>
  );
}
