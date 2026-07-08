import Image from 'next/image';
import styles from './EmptyState.module.scss';
import Title from '../Title/Title';
import Subtitle from '../Subtitle/Subtitle';

type EmptyStateProps = {
  image: string;
  title: string;
  subtitle?: string;
};

export default function EmptyState({ image, title, subtitle }: EmptyStateProps) {
  return (
    <div className={styles['empty-state']}>
      <div className={styles['empty-state__content']}>
        <Image
          className={styles['empty-state__image']}
          src={image}
          alt={title}
          width={200}
          height={100}
        />
        <Title noMargin>{title}</Title>
        {subtitle && <Subtitle noMargin>{subtitle}</Subtitle>}
      </div>
    </div>
  );
}
