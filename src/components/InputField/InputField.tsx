import styles from './style.module.scss';

type InputFieldProps = {
  width?: string;
  label?: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

export function InputField({ width, label, value, error, onChange }: InputFieldProps) {
  return (
    <div className={styles['input-field']} style={{ width }}>
      {label && <label>{label}</label>}
      <input
        className={error ? styles['input-field__input--error'] : styles['input-field__input']}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="error-text">{error}</div>
    </div>
  );
}
