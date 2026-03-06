import { text } from 'stream/consumers';
import styles from './style.module.scss';

type InputFieldProps = {
  width?: string;
  label?: string;
  value: string;
  error?: string;
  placeholder?: string;
  maxLength?: number;
  type?: 'text' | 'password' | 'date';
  onChange: (value: string) => void;
};

export function InputField({
  width,
  label,
  value,
  error,
  placeholder,
  maxLength,
  type,
  onChange,
}: InputFieldProps) {
  return (
    <div className={styles['input-field']} style={{ width }}>
      {label && <label>{label}</label>}
      <input
        className={error ? styles['input-field__input--error'] : styles['input-field__input']}
        type={type ? type : 'text'}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="error-text">{error}</div>
    </div>
  );
}
