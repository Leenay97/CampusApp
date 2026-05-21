import { Season } from '@/app/types';
import { memo, useMemo } from 'react';
import styles from './SeasonsPage.module.scss';
import SeasonsTableHeader from './SeasonsTableHeader';
import SeasonRow from './SeasonRow';

type SeasonsTableProps = {
  seasons: Season[];
  onArchive: (seasonId: string) => void;
  onActivate: (seasonId: string) => void;
  onRefetchSeason: () => void;
};

function SeasonsTable({ seasons, onRefetchSeason, onArchive, onActivate }: SeasonsTableProps) {
  const sortedSeasons = useMemo(() => {
    return [...(seasons || [])].sort((a, b) => {
      if (a.isArchived && !b.isArchived) return 1;
      if (!a.isArchived && b.isArchived) return -1;
      return 0;
    });
  }, [seasons]);

  return (
    <div className={styles['seasons__table']}>
      <SeasonsTableHeader />
      {sortedSeasons?.map((season) => (
        <SeasonRow
          onRefetchSeason={onRefetchSeason}
          key={season.id}
          season={season}
          onArchive={onArchive}
          onActivate={onActivate}
        />
      ))}
    </div>
  );
}

export default memo(SeasonsTable);
