import styles from './style.module.scss';

interface BurgerProps {
  isOpen: boolean;
  onClick: () => void;
}

export function Burger({ isOpen, onClick }: BurgerProps) {
  return (
    <div className={`${styles.burger} ${isOpen ? styles['burger--open'] : ''}`} onClick={onClick}>
      <svg viewBox="0 0 40 40" className={styles.burger__svg}>
        <path
          className={`${styles.burger__line} ${styles['burger__line--top']}`}
          d="M5,12 Q15,6 25,12 Q35,18 35,12"
          fill="none"
          stroke="var(--color-dark-blue)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          className={`${styles.burger__line} ${styles['burger__line--middle']}`}
          d="M5,20 Q15,14 25,20 Q35,26 35,20"
          fill="none"
          stroke="var(--color-dark-blue)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          className={`${styles.burger__line} ${styles['burger__line--bottom']}`}
          d="M5,28 Q15,22 25,28 Q35,34 35,28"
          fill="none"
          stroke="var(--color-dark-blue)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          className={`${styles.burger__cross} ${styles['burger__cross--left']}`}
          d="M12,12 L28,28"
          fill="none"
          stroke="var(--color-dark-blue)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          className={`${styles.burger__cross} ${styles['burger__cross--right']}`}
          d="M28,12 L12,28"
          fill="none"
          stroke="var(--color-dark-blue)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
