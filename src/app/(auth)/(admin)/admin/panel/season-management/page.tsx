'use client';

import AddSeasonModal from '@/components/AddSeasonModal/AddSeasonModal';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import Section from '@/components/Section/Section';
import Title from '@/components/Title/Title';
import { GET_SEASONS } from '@/graphql/queries/GetSeasons';
import { useQuery } from '@apollo/client';
import SeasonsTable from './SeasonsTable';
import styles from './SeasonsPage.module.scss';
import { useState } from 'react';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { ACTIVATE_SEASON } from '@/graphql/mutations/ActivateSeason';
import { ARCHIVE_SEASON } from '@/graphql/mutations/ArchiveSeason';
import Loader from '@/components/Loader/Loaader';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';

function SeasonManagementPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const { data, loading, refetch } = useQuery(GET_SEASONS);
  const [activateSeason] = useGlobalLoadingMutation(ACTIVATE_SEASON);
  const [archiveSeason] = useGlobalLoadingMutation(ARCHIVE_SEASON);

  function handleOpenModal() {
    setIsCreateModalOpen(true);
  }

  function handleSeasonCreated() {
    setIsCreateModalOpen(false);
    refetch();
  }

  async function handleArchiveSeason(seasonId: string) {
    try {
      await archiveSeason({ id: seasonId });
      await refetch();
    } catch (error) {
      console.error('Error archiving season:', error);
    }
  }

  async function handleActivateSeason(seasonId: string) {
    try {
      await activateSeason({ id: seasonId });
      await refetch();
    } catch (error) {
      console.error('Error activating season:', error);
    }
  }

  if (loading) {
    return (
      <CenteredContainer>
        <Section>
          <Loader />
        </Section>
      </CenteredContainer>
    );
  }

  return (
    <CenteredContainer wide noPaddingTop>
      <Section>
        <Title>Season Management</Title>
        <PrimaryButton className={styles['add-season-btn']} onClick={handleOpenModal}>
          Добавить сезон
        </PrimaryButton>
        {isCreateModalOpen && (
          <AddSeasonModal
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleSeasonCreated}
          />
        )}
        <SeasonsTable
          onRefetchSeason={refetch}
          onArchive={handleArchiveSeason}
          onActivate={handleActivateSeason}
          seasons={data?.seasons}
        />
      </Section>
    </CenteredContainer>
  );
}
export default SeasonManagementPage;
