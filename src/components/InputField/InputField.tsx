import styles from './InputField.module.scss';
import { CSSProperties, useState } from 'react';
import EyeIcon from '@/components/Icons/EyeIcon/EyeIcon';
import EyeOffIcon from '@/components/Icons/EyeOffIcon/EyeOffIcon';

type InputFieldProps = {
  width?: string;
  label?: string;
  value: string;
  error?: string;
  placeholder?: string;
  maxLength?: number;
  type?: string;
  style?: CSSProperties;
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
  style,
  onChange,
}: InputFieldProps) {
  const isPassword = type === 'password';
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={styles['input-field']} style={{ width }}>
      {label && <label>{label}</label>}
      <div className={styles['input-field__wrapper']}>
        <input
          className={error ? styles['input-field__input--error'] : styles['input-field__input']}
          type={isPassword && isVisible ? 'text' : type ? type : 'text'}
          placeholder={placeholder}
          value={value}
          maxLength={maxLength}
          style={isPassword ? { ...style, paddingRight: 36 } : style}
          onChange={(e) => onChange(e.target.value)}
        />
        {isPassword && (
          <button
            type="button"
            className={styles['input-field__toggle']}
            onClick={() => setIsVisible((prev) => !prev)}
            aria-label={isVisible ? 'Скрыть пароль' : 'Показать пароль'}
            tabIndex={-1}
          >
            {isVisible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      <div className="error-text">{error}</div>
    </div>
  );
}
