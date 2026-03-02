'use client';
import { JSX, useState } from 'react';
import Workshop from '@components/Workshop/Workshop';
import style from './style.module.scss';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import CreateWorkshopModal from '@/components/CreateWorkshopModal/CreateWorkshopModal';
import { useQuery } from '@apollo/client';
import queries from '@/graphql/queries';

export default function WorkShopsPage(): JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, loading, error, refetch } = useQuery(queries.GET_WORKSHOPS);

  function handleOpenModal() {
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
  }

  console.log('Workshops data:', data);

  return (
    <div className="centered-container">
      <div className={style['workshops-wrapper']}>
        <PrimaryButton onClick={handleOpenModal} width="100%">
          Добавить мастеркласс
        </PrimaryButton>
        <CreateWorkshopModal isOpen={isModalOpen} onSubmit={refetch} onClose={handleCloseModal} />
        {(data?.workshops || []).map((workshop: Workshop) => (
          <Workshop
            key={workshop.id}
            name={workshop.name}
            description={workshop.description}
            studentAmount={0}
            maxStudentAmount={workshop.maxStudents}
            place={workshop.place}
            teacher={workshop.teacher.name}
            // isClosed={workshop.isClosed}
          />
        ))}
      </div>
    </div>
  );
}
