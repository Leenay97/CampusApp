'use client';
import { JSX, useState, useMemo, useEffect } from 'react';
import Workshop from '@components/Workshop/Workshop';
import style from './style.module.scss';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import CreateWorkshopModal from '@/components/CreateWorkshopModal/CreateWorkshopModal';
import { useQuery } from '@apollo/client';
import queries from '@/graphql/queries';
import { Workshop as WorkshopType } from '@/app/types';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Section from '@/components/Section/Section';
import Loader from '@/components/Loader/Loaader';
import { GET_ACTIVE_SEASON } from '@/graphql/queries/GetActiveSeason';

export default function WorkShopsPage(): JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showClosed, setShowClosed] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const { data: seasonData, loading: seasonLoading } = useQuery(GET_ACTIVE_SEASON);
  const { data, loading, refetch } = useQuery(queries.GET_WORKSHOPS, {
    variables: { isSport: false },
  });

  function formatLocalDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function isDateTodayOrFuture(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date >= today;
  }

  const allDates = useMemo(() => {
    if (!seasonData?.activeSeason?.startDate || !seasonData?.activeSeason?.endDate) {
      return [];
    }

    try {
      const startTimestamp = parseInt(seasonData.activeSeason.startDate);
      const endTimestamp = parseInt(seasonData.activeSeason.endDate);

      const start = new Date(startTimestamp);
      const end = new Date(endTimestamp);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return [];
      }

      const dates = [];
      const currentDate = new Date(start);

      while (currentDate <= end) {
        if (isDateTodayOrFuture(new Date(currentDate))) {
          const dateString = formatLocalDate(currentDate);
          dates.push({
            label: currentDate.toLocaleDateString('ru-RU'),
            value: dateString,
            timestamp: currentDate.getTime(),
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return dates;
    } catch (error) {
      console.error('Error generating dates:', error);
      return [];
    }
  }, [seasonData?.activeSeason?.startDate, seasonData?.activeSeason?.endDate]);

  useEffect(() => {
    if (allDates.length > 0 && !selectedDate) {
      const today = new Date();
      const todayString = formatLocalDate(today);

      const todayExists = allDates.some((date) => date.value === todayString);

      if (todayExists) {
        /*eslint-disable react-hooks/set-state-in-effect*/
        setSelectedDate(todayString);
      } else {
        setSelectedDate(allDates[0].value);
      }
    }
  }, [allDates, selectedDate]);

  const activeWorkshops = [...(data?.workshops ?? [])].filter((w) => !w.isClosed);
  const closedWorkshops = [...(data?.workshops ?? [])].filter((w) => w.isClosed);

  function handleOpenModal() {
    if (!selectedDate) {
      alert('Пожалуйста, выберите дату мастеркласса');
      return;
    }
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
  }

  function handleSubmit() {
    setIsModalOpen(false);
    refetch();
  }

  function handleDateChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedDate(e.target.value);
  }

  if (loading || seasonLoading)
    return (
      <CenteredContainer>
        <Section>
          <Loader />
        </Section>
      </CenteredContainer>
    );

  return (
    <CenteredContainer noPadding>
      <div className={style['workshops-wrapper']}>
        <PrimaryButton onClick={handleOpenModal} width="100%">
          Добавить мастеркласс
        </PrimaryButton>

        <CreateWorkshopModal
          isOpen={isModalOpen}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
          allDates={allDates}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
        />
        {(activeWorkshops || []).map((workshop: WorkshopType) => (
          <Workshop
            key={workshop.id}
            name={workshop.name}
            description={workshop.description}
            students={workshop.students}
            maxStudentAmount={workshop.maxStudents}
            place={workshop.place?.name}
            teacher={workshop.teacher.name}
            isClosed={workshop.isClosed}
            toClose
          />
        ))}
        <PrimaryButton onClick={() => setShowClosed((prev) => !prev)}>
          {showClosed ? 'Скрыть закрытые' : 'Показать закрытые'}
        </PrimaryButton>
        {showClosed &&
          closedWorkshops.map((workshop: WorkshopType) => (
            <Workshop
              key={workshop.id}
              name={workshop.name}
              description={workshop.description}
              students={workshop.students ?? []}
              maxStudentAmount={workshop.maxStudents}
              place={workshop.place?.name}
              teacher={workshop.teacher?.name}
              maxAge={workshop.maxAge}
              toClose
              isClosed={workshop.isClosed}
            />
          ))}
      </div>
    </CenteredContainer>
  );
}
