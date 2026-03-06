import { Place } from '@/app/types';
import styles from './style.module.scss';

type Props = {
  place?: Place;
  onClick: () => void;
};

export default function PlacesCell({ place, onClick }: Props) {
  return (
    <div
      className={styles['cell']}
      style={place?.color ? { backgroundColor: place?.color, color: '#FFFFFF' } : {}}
      onClick={onClick}
    >
      {place?.name}
    </div>
  );
}
