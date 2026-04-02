'use client';

import { useQuery } from '@apollo/client';
import { queries } from '@graphql/queries/index';
import { AddGroup } from '@components/AddGroup/AddGroup';
import { GroupsList } from '@components/GroupsList/GroupsList';
import styles from './SeasonsPage.module.scss';
import { AddSeason } from '@/components/AddSeason/AddSeason';
import { useMemo, useState } from 'react';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import mutations from '@/graphql/mutations';
import { SeasonSelect } from '@/components/SeasonSelect/SeasonSelect';
import Modal from '@/components/Modal/Modal';
import { GroupInput, Season, Teacher } from '@/app/types';
import Section from '@/components/Section/Section';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Title from '@/components/Title/Title';
import Loader from '@/components/Loader/Loaader';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';

function SeasonsPage() {
  const [seasonGroups, setSeasonGroups] = useState<GroupInput[]>([]);
  const [seasonData, setSeasonData] = useState({
    year: '',
    number: '',
    startDate: '',
    endDate: '',
  });
  const [selectedSeason, setSelectedSeason] = useState<Partial<Season>>({ id: '' });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { loading: teachersLoading, data: teachersData } = useQuery(queries.GET_TEACHERS);
  const {
    loading: seasonsLoading,
    data: seasonsData,
    refetch: refetchSeasons,
  } = useQuery(queries.GET_SEASONS);
  const [createSeason] = useGlobalLoadingMutation(mutations.CREATE_SEASON);
  const [activateSeason] = useGlobalLoadingMutation(mutations.ACTIVATE_SEASON);

  const teachers = useMemo(() => teachersData?.teachers ?? [], [teachersData?.teachers]);

  const formattedTeachers = useMemo(() => {
    if (!teachers.length) return [];
    if (!seasonGroups.length) return teachers;

    const filteredTeachers: Teacher[] = teachers.filter(
      (teacher: Teacher) => !seasonGroups.some((group) => group.teacherIds.includes(teacher.id)),
    );
    return [...filteredTeachers].sort((a, b) => a.name.localeCompare(b.name));
  }, [seasonGroups, teachers]);

  function handleDeleteGroup(name: string) {
    setSeasonGroups((prev) => prev.filter((group) => group.name !== name));
  }

  function handleAddGroup(group: GroupInput) {
    setSeasonGroups((prev) => [...prev, group]);
  }

  function handleChangeSeasonData(
    year: string,
    number: string,
    startDate: string,
    endDate: string,
  ) {
    setSeasonData({ year, number, startDate, endDate });
  }

  async function handleCreateSeason() {
    try {
      await createSeason({
        year: seasonData.year,
        number: seasonData.number,
        startDate: seasonData.startDate,
        endDate: seasonData.endDate,
        groupTeachers: seasonGroups,
      });
      refetchSeasons();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleActivateSeason() {
    try {
      await activateSeason({
        id: selectedSeason.id,
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  }

  if (teachersLoading || seasonsLoading)
    return (
      <CenteredContainer>
        <Section>
          <Loader />
        </Section>
      </CenteredContainer>
    );

  return (
    <CenteredContainer noPadding>
      <Section>
        <Title>Добавить сезон</Title>
        <AddSeason
          year={seasonData.year}
          number={seasonData.number}
          startDate={seasonData.startDate}
          endDate={seasonData.endDate}
          onChange={handleChangeSeasonData}
        />
        <AddGroup onAdd={handleAddGroup} teachers={formattedTeachers} />
        <GroupsList groups={seasonGroups} onDelete={handleDeleteGroup} />
        <PrimaryButton onClick={handleCreateSeason}>Создать сезон</PrimaryButton>
      </Section>

      <Section>
        <Title>Активировать сезон</Title>
        <div className={styles['flex-row']}>
          <SeasonSelect
            seasons={seasonsData?.seasons}
            value={selectedSeason}
            onChange={setSelectedSeason}
          />
          <PrimaryButton onClick={() => setIsModalOpen(true)}>Активировать</PrimaryButton>
        </div>
      </Section>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleActivateSeason}
        hasCancel
        onCancel={() => setIsModalOpen(false)}
        text={`Активировать ${selectedSeason.number} сезон ${selectedSeason.year}?`}
        description="Другие сезоны станут архивными. Активировать их снова уже не получится. Информацию о прошлых сезонах можно найти в разделе 'История сезонов'."
      />
    </CenteredContainer>
  );
}

export default SeasonsPage;
