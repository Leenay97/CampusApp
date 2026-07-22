'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './MazeRunnerCodeInput.module.scss';

type MazeRunnerCodeInputProps = {
  length: number;
  disabled?: boolean;
  hasError?: boolean;
  onChange: (code: string) => void;
};

export default function MazeRunnerCodeInput({
  length,
  disabled = false,
  hasError = false,
  onChange,
}: MazeRunnerCodeInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setDigits(Array(length).fill(''));
  }, [length]);

  function focusCell(index: number) {
    inputRefs.current[index]?.focus();
  }

  function handleChange(index: number, rawValue: string) {
    const value = rawValue.replace(/\D/g, '');
    if (!value) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      onChange(next.join(''));
      return;
    }

    // Вставка сразу нескольких цифр (например, paste) — раскладываем по ячейкам
    const chars = value.split('');
    const next = [...digits];
    let cursor = index;
    for (const char of chars) {
      if (cursor >= length) break;
      next[cursor] = char;
      cursor += 1;
    }
    setDigits(next);
    onChange(next.join(''));

    if (cursor < length) {
      focusCell(cursor);
    } else {
      inputRefs.current[length - 1]?.blur();
    }
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      focusCell(index - 1);
    }
  }

  return (
    <div className={styles['maze-runner-code-input']}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          className={`${styles['maze-runner-code-input__cell']} ${
            hasError ? styles['maze-runner-code-input__cell--error'] : ''
          }`}
          type="text"
          inputMode="numeric"
          maxLength={length}
          value={digit}
          disabled={disabled}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onFocus={(event) => event.target.select()}
        />
      ))}
    </div>
  );
}
