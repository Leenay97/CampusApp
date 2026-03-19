import styles from './Filters.module.scss';

type FiltersType = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

export default function Filters({ options, value, onChange }: FiltersType) {
  return (
    <div className={styles['filters']}>
      {options.length > 0 &&
        options.map((option) => (
          <div
            key={option}
            className={option === value ? styles['filters__item--active'] : styles['filters__item']}
            onClick={() => onChange(option)}
          >
            {option}
          </div>
        ))}
    </div>
  );
}
