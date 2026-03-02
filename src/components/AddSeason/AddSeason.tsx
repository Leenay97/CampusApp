import { InputField } from '@components/InputField/InputField';
import styles from './style.module.scss';

type AddSeasonProps = {
  year: string;
  number: string;
  onChange: (year: string, number: string) => void;
};

export function AddSeason({ year, number, onChange }: AddSeasonProps) {
  function handleChangeYear(value: string) {
    onChange(value, number);
  }

  function handleChangeNumber(value: string) {
    onChange(year, value);
  }

  return (
    <div className={styles['add-teacher']}>
      <div className={styles['add-teacher__input']}>
        <h1 className="subtitle">Год</h1>
        <InputField
          value={year}
          width="80px"
          onChange={handleChangeYear}
          maxLength={4}
          placeholder={'Год'}
        />
        <h1 className="subtitle">Сезон</h1>
        <InputField
          value={number}
          width="40px"
          maxLength={2}
          onChange={handleChangeNumber}
          placeholder="№"
        />
      </div>
    </div>
  );
}
