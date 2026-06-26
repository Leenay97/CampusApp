import { Group, Season } from '@/app/types';
import { memo, useState } from 'react';
import styles from './SeasonsPage.module.scss';
import GroupBadge from './components/GroupBadge';
import { CreateGroupModal } from '@/components/CreateGroupModal/CreateGroupModal';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@/components/SecondaryButton/SecondaryButton';
import Badge from './components/Badge';
import SeasonActionModal from './SeasonActionModal';

type SeasonRowProps = {
  season: Season;
  onArchive: (seasonId: string) => void;
  onActivate: (seasonId: string) => void;
  onRefetchSeason: () => void;
};

function SeasonRow({ season, onRefetchSeason, onActivate, onArchive }: SeasonRowProps) {
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState<boolean>(false);
  const [seasonActionModal, setSeasonActionModal] = useState<'archive' | 'activate' | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group>();

  const seasonName = `[${season.year}] Сезон ${season.number}`;

  console.log(season);

  function handleGroupClick(group?: Group) {
    setSelectedGroup(group);
    setIsCreateGroupModalOpen(true);
  }

  function handleCloseGroupModal() {
    setSelectedGroup(undefined);
    setIsCreateGroupModalOpen(false);
  }

  function handleActivateSeason() {
    onActivate(season.id);
    setSeasonActionModal(null);
  }

  function handleArchiveSeason() {
    onArchive(season.id);
    setSeasonActionModal(null);
  }

  return (
    <div
      className={`${styles['season-row']} ${season.isActive ? styles['season-row_active'] : ''} ${season.isArchived ? styles['season-row_archived'] : ''}`}
    >
      <div className={styles['season-row__item']}>
        {seasonName}
        {season.isArchived && <Badge isArchived={true} />}
      </div>
      <div className={`${styles['season-row__item']} ${styles['season-row__group']}`}>
        {season.groups?.map((group) => (
          <GroupBadge key={group.id} name={group.name} onClick={() => handleGroupClick(group)} />
        ))}
        {!season.isActive && !season.isArchived && (
          <GroupBadge add name={'+'} onClick={() => setIsCreateGroupModalOpen(true)} />
        )}
      </div>
      <div className={styles['season-row__item']}>{season.year}</div>
      <div className={`${styles['season-row__item']} ${styles['season-row__controls']}`}>
        {season.isActive && (
          <SecondaryButton onClick={() => setSeasonActionModal('archive')}>Archive</SecondaryButton>
        )}
        {!season.isActive && !season.isArchived && (
          <PrimaryButton onClick={() => setSeasonActionModal('activate')}>Activate</PrimaryButton>
        )}
      </div>
      {isCreateGroupModalOpen && !season.isActive && !season.isArchived && (
        <CreateGroupModal
          group={selectedGroup}
          onRefetchSeason={onRefetchSeason}
          seasonId={season.id}
          onClose={handleCloseGroupModal}
        />
      )}
      {seasonActionModal && (
        <SeasonActionModal
          action={seasonActionModal}
          handleSubmit={
            seasonActionModal === 'archive' ? handleArchiveSeason : handleActivateSeason
          }
          seasonName={seasonName}
          onClose={() => setSeasonActionModal(null)}
        />
      )}
    </div>
  );
}

export default memo(SeasonRow);
