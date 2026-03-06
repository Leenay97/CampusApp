'use client';

import { useMutation, useQuery } from '@apollo/client';
import { queries } from '@graphql/queries/index';
import { AddGroup } from '@components/AddGroup/AddGroup';
import { GroupsList } from '@components/GroupsList/GroupsList';
import styles from './style.module.scss';
import { InputField } from '@/components/InputField/InputField';
import { AddSeason } from '@/components/AddSeason/AddSeason';
import { useEffect, useMemo, useState } from 'react';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import mutations from '@/graphql/mutations';
import { SeasonSelect } from '@/components/SeasonSelect/SeasonSelect';
import Modal from '@/components/Modal/Modal';
import { GroupInput, Season, Teacher } from '@/app/types';

function SeasonsPage() {
  const [seasonGroups, setSeasonGroups] = useState<GroupInput[]>([]);
  const [seasonData, setSeasonData] = useState({
    year: '',
    number: '',
    startDate: '',
    endDate: '',
  });
  const [password, setPassword] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<Partial<Season>>({ id: '' });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { loading: teachersLoading, data: teachersData } = useQuery(queries.GET_TEACHERS);
  const { loading: seasonsLoading, data: seasonsData } = useQuery(queries.GET_SEASONS);
  const [createSeason] = useMutation(mutations.CREATE_SEASON);
  const [activateSeason] = useMutation(mutations.ACTIVATE_SEASON);

  useEffect(() => {
    console.log(seasonData);
  }, [seasonData]);

  const teachers = teachersData?.teachers ?? [];

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
        variables: {
          year: seasonData.year,
          number: seasonData.number,
          startDate: seasonData.startDate,
          endDate: seasonData.endDate,
          groupTeachers: seasonGroups,
        },
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function handleActivateSeason() {
    try {
      await activateSeason({
        variables: {
          id: selectedSeason.id,
        },
      });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="centered-container">
      <div className="flex-container">
        <div className={styles['prohibited-section']}>
          <div className={styles['prohibited-section__header']}>
            <h2 className="subtitle">Prohibited Actions</h2>
            <div>Введите пароль чтобы открыть секцию.</div>
            <InputField value={password} onChange={setPassword} width="200px" />
          </div>
          <div
            className={
              password == process.env.NEXT_PUBLIC_PROHIBITED_SECTION_PASSWORD
                ? styles['prohibited-section__content']
                : styles['prohibited-section__content--hidden']
            }
          >
            <h1 className="title">Добавить сезон</h1>
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
          </div>
        </div>

        <div className={styles['prohibited-section']}>
          <h1 className="title">Активировать сезон</h1>
          <div className={styles['flex-row']}>
            <SeasonSelect
              seasons={seasonsData?.seasons}
              value={selectedSeason}
              onChange={setSelectedSeason}
            />
            <PrimaryButton onClick={() => setIsModalOpen(true)}>Активировать</PrimaryButton>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleActivateSeason}
        hasCancel
        onCancel={() => setIsModalOpen(false)}
        text={`Активировать ${selectedSeason.number} сезон ${selectedSeason.year}?`}
        description="Другие сезоны станут архивными. Активировать их снова уже не получится. Информацию о прошлых сезонах можно найти в разделе 'История сезонов'."
      />
    </div>
  );
}

export default SeasonsPage;
