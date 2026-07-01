import styles from './Burger.module.scss';

interface BurgerProps {
  isOpen: boolean;
  onClick: () => void;
}

export function Burger({ isOpen, onClick }: BurgerProps) {
  return (
    <div className={`${styles.burger} ${isOpen ? styles['burger--open'] : ''}`} onClick={onClick}>
      <svg viewBox="0 0 40 40" className={styles.burger__svg}>
        <line
          className={`${styles.burger__line} ${styles['burger__line--top']}`}
          x1="6"
          y1="12"
          x2="34"
          y2="12"
          stroke="var(--color-dark-blue)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          className={`${styles.burger__line} ${styles['burger__line--middle']}`}
          x1="6"
          y1="20"
          x2="34"
          y2="20"
          stroke="var(--color-dark-blue)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          className={`${styles.burger__line} ${styles['burger__line--bottom']}`}
          x1="6"
          y1="28"
          x2="34"
          y2="28"
          stroke="var(--color-dark-blue)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
