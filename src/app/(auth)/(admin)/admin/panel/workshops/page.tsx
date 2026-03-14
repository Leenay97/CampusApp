'use client';
import { JSX, useState } from 'react';
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

export default function WorkShopsPage(): JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showClosed, setShowClosed] = useState<boolean>(false);

  const { data, loading, refetch } = useQuery(queries.GET_WORKSHOPS, {
    variables: { isSport: false },
  });

  const activeWorkshops = [...(data?.workshops ?? [])].filter((w) => !w.isClosed);
  const closedWorkshops = [...(data?.workshops ?? [])].filter((w) => w.isClosed);

  function handleOpenModal() {
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
  }
  function handleSubmit() {
    setIsModalOpen(false);
    refetch();
  }

  console.log(data);

  if (loading)
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
            noButtons
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
