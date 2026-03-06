import { InputField } from '@components/InputField/InputField';
import styles from './style.module.scss';

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
    console.log(value);
    onChange(year, number, value, endDate);
  }

  function handleChangeEndDate(value: string) {
    onChange(year, number, startDate, value);
  }

  return (
    <div className={styles['add-season']}>
      <div className={styles['add-season__input']}>
        <h1 className="subtitle no-margin">Год</h1>
        <InputField
          value={year}
          width="80px"
          onChange={handleChangeYear}
          maxLength={4}
          placeholder={'Год'}
        />
        <h1 className="subtitle no-margin">Сезон</h1>
        <InputField
          value={number}
          width="40px"
          maxLength={2}
          onChange={handleChangeNumber}
          placeholder="№"
        />
      </div>
      <h1 className="subtitle no-margin">Начало</h1>
      <InputField value={startDate} width="150px" type="date" onChange={handleChangeStartDate} />
      <h1 className="subtitle no-margin">Конец</h1>
      <InputField value={endDate} width="150px" type="date" onChange={handleChangeEndDate} />
    </div>
  );
}
