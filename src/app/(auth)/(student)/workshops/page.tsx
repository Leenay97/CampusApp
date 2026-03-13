'use client';
import { JSX } from 'react';
import Workshop from '@components/Workshop/Workshop';
import style from './style.module.scss';
import { useQuery } from '@apollo/client';
import queries from '@/graphql/queries';
import { User, Workshop as WorkshopType } from '@/app/types';
import { useUser } from '@/contexts/UserContext';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import { JOIN_WORKSHOP } from '@/graphql/mutations/JoinWorkshop';
import Section from '@/components/Section/Section';
import Loader from '@/components/Loader/Loaader';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';

export default function WorkShopsPage(): JSX.Element {
  const { data, loading, refetch } = useQuery(queries.GET_TODAY_WORKSHOPS);
  const [joinWorkshop] = useGlobalLoadingMutation(JOIN_WORKSHOP);
  const { user } = useUser();

  async function handleJoin(workshopId: string) {
    try {
      await joinWorkshop({ studentId: user?.id, workshopId: workshopId });
      refetch();
    } catch (error) {
      console.log(error);
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

  return (
    <CenteredContainer>
      <div className={style['workshops-wrapper']}>
        {(workshopsToShow || []).map((workshop: WorkshopType) => (
          <Workshop
            key={workshop.id}
            name={workshop.name}
            description={workshop.description}
            students={workshop.students ?? []}
            maxStudentAmount={workshop.maxStudents}
            place={workshop.place.name}
            teacher={workshop.teacher.name}
            maxAge={workshop.maxAge}
            handleJoin={() => handleJoin(workshop.id)}
            joined={workshop.students.some((student) => student.id === user?.id)}
          />
        ))}
      </div>
    </CenteredContainer>
  );
}
