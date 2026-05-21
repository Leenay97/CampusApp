import { memo } from 'react';
import styles from './SwitchSelector.module.scss';

type SwitchSelectorProps = {
  value: string;
  values: string[];
  onChange: (value: string) => void;
};

function SwitchSelector({ value, values, onChange }: SwitchSelectorProps) {
  return (
    <div className={styles['switch-selector']}>
      {values.map((item) => (
        <div
          key={item}
          className={
            value === item
              ? styles['switch-selector__item_active']
              : styles['switch-selector__item']
          }
          onClick={() => onChange(item)}
        >
          {item}
        </div>
      ))}
    </div>
  );
}

export default memo(SwitchSelector);
