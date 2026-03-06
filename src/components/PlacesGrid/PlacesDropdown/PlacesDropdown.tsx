import { Place } from '@/app/types';
import styles from './style.module.scss';

type Props = {
  places: (Place | undefined)[];
  onSelect: (place: Place) => void;
};

export default function PlacesDropdown({ places, onSelect }: Props) {
  return (
    <div className={styles['dropdown']}>
      {places
        .filter((place): place is Place => !!place)
        .map((place) => (
          <div
            key={place?.id}
            className={styles['dropdown__item']}
            style={place?.color ? { backgroundColor: place?.color, color: '#FFFFFF' } : {}}
            onClick={() => onSelect(place)}
          >
            {place?.name}
          </div>
        ))}
    </div>
  );
}
