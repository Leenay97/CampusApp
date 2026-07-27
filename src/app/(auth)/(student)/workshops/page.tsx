'use client';
import { JSX } from 'react';
import Workshop from '@components/Workshop/Workshop';
import styles from './WorkShopsPage.module.scss';
import { useQuery } from '@apollo/client';
import queries from '@/graphql/queries';
import { User, Workshop as WorkshopType } from '@/app/types';
import { useUser } from '@/contexts/UserContext';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import { JOIN_WORKSHOP } from '@/graphql/mutations/JoinWorkshop';
import Section from '@/components/Section/Section';
import Loader from '@/components/Loader/Loaader';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import EmptyState from '@/components/EmptyState/EmptyState';
import { isTimePassed } from '@/utils/time';

export default function WorkShopsPage(): JSX.Element {
  const { data, loading, refetch } = useQuery(queries.GET_TODAY_WORKSHOPS);
  const { data: technicalData } = useQuery(queries.GET_TECHICAL_DATA);
  const [joinWorkshop] = useGlobalLoadingMutation(JOIN_WORKSHOP);
  const { user } = useUser();

  const registrationClosed = isTimePassed(technicalData?.technicalData?.workshopEnd);

  async function handleJoin(workshopId: string) {
    try {
      await joinWorkshop({ studentId: user?.id, workshopId: workshopId });
      refetch();
    } catch (error) {
      console.error(error);
    }
  }

  if (loading)
    return (
      <CenteredContainer>
        <Section>
          <Loader />
        </Section>
      </CenteredContainer>
    );

  const workshopsToShow = (() => {
    const joinedWorkshop = data?.todayWorkshops.find((workshop: WorkshopType) =>
      workshop.students.some((student: User) => student.id === user?.id),
    );
    return joinedWorkshop ? [joinedWorkshop] : data?.todayWorkshops;
  })();

  if (!workshopsToShow?.length) {
    return (
      <CenteredContainer>
        <EmptyState
          image="/img/workshop.png"
          title="Мастер-классов еще нет"
          subtitle="Загляни сюда чуть позже"
        />
      </CenteredContainer>
    );
  }

  return (
    <CenteredContainer>
      <div className={styles['workshops-wrapper']}>
        {(workshopsToShow || []).map((workshop: WorkshopType) => (
          <Workshop
            key={workshop.id}
            name={workshop.name}
            description={workshop.description}
            image={workshop.image}
            students={workshop.students ?? []}
            maxStudentAmount={workshop.maxStudents}
            place={workshop.place.name}
            teacher={workshop.teacher.name}
            avatar={workshop.teacher.photoUrl}
            maxAge={workshop.maxAge}
            handleJoin={() => handleJoin(workshop.id)}
            joined={workshop.students.some((student) => student.id === user?.id)}
            registrationClosed={registrationClosed}
          />
        ))}
      </div>
    </CenteredContainer>
  );
}
