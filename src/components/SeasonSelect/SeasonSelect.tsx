import { useMemo, useState } from 'react';
import styles from './style.module.scss';
import { Season } from '@/app/types';

type CustomSelectProps = {
  seasons: Season[];
  value: Partial<Season>;
  onChange: (value: Season) => void;
};

export function SeasonSelect({ seasons, value, onChange }: CustomSelectProps) {
  const [showSeasons, setShowSeasons] = useState<boolean>(false);

  const handleSeasonSelect = (season: Season) => {
    if (season?.isArchived) return;
    onChange(season);
    setShowSeasons(false);
  };

  const sortedSeasons = useMemo(() => {
    if (!seasons) return [];

    return [...seasons].sort((a, b) => {
      if (a.isArchived && !b.isArchived) return 1;
      if (!a.isArchived && b.isArchived) return -1;

      if (a.year !== b.year) return a.year.localeCompare(b.year);
      return a.number.localeCompare(b.number);
    });
  }, [seasons]);

  return (
    <div className={styles['custom-select']}>
      <div className={styles['custom-select__field']}>
        <div
          className={styles['custom-select__input']}
          onClick={() => {
            setShowSeasons((prev) => !prev);
          }}
        >
          {value.year ? `[${value.year}] Сезон ${value.number}` : 'Выбери сезон'}
        </div>
      </div>
      {showSeasons && (
        <ul className={styles['custom-select__list']}>
          {sortedSeasons.map((season) => (
            <li
              key={season.id}
              className={
                season.isArchived
                  ? styles['custom-select__option--archived']
                  : styles['custom-select__option']
              }
              onClick={() => handleSeasonSelect(season)}
            >
              {`[${season.year}] Сезон ${season.number}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
