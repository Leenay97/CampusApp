import styles from './style.module.scss';

type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <label className={styles['checkbox__label']}>
      <input className={styles['checkbox']} type="checkbox" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}
