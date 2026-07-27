'use client';
import styles from './RadioGroup.module.scss';

type RadioOption = {
  value: string;
  label: string;
};

type RadioGroupProps = {
  name: string;
  value: string;
  options: readonly RadioOption[];
  onChange: (value: string) => void;
};

export default function RadioGroup({ name, value, options, onChange }: RadioGroupProps) {
  return (
    <div className={styles['radio-group']} role="radiogroup">
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <label
            key={option.value}
            className={`${styles['radio-group__item']} ${
              checked ? styles['radio-group__item--checked'] : ''
            }`}
          >
            <input
              className={styles['radio-group__input']}
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
            />
            <span className={styles['radio-group__mark']} />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}
