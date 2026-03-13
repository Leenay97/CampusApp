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

  const { data, loading, refetch } = useQuery(queries.GET_WORKSHOPS);

  function handleOpenModal() {
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
  }

  const sortedWorkshops = [...(data?.workshops ?? [])].sort(
    (a: WorkshopType, b: WorkshopType) => Number(a.isClosed) - Number(b.isClosed),
  );

  console.log(sortedWorkshops);

  if (loading)
    return (
      <CenteredContainer>
        <Section>
          <Loader />
        </Section>
      </CenteredContainer>
    );

  return (
    <CenteredContainer>
      <div className={style['workshops-wrapper']}>
        <PrimaryButton onClick={handleOpenModal} width="100%">
          Добавить мастеркласс
        </PrimaryButton>
        <CreateWorkshopModal isOpen={isModalOpen} onSubmit={refetch} onClose={handleCloseModal} />
        {(sortedWorkshops || []).map((workshop: WorkshopType) => (
          <Workshop
            key={workshop.id}
            name={workshop.name}
            description={workshop.description}
            students={workshop.students}
            maxStudentAmount={workshop.maxStudents}
            place={workshop.place?.name}
            teacher={workshop.teacher.name}
            isClosed={workshop.isClosed}
          />
        ))}
      </div>
    </CenteredContainer>
  );
}
