'use client';
import { Workshop as WorkshopType } from '@/app/types';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Section from '@/components/Section/Section';
import Title from '@/components/Title/Title';
import Workshop from '@components/Workshop/Workshop';
import { useUser } from '@/contexts/UserContext';
import { GET_WORKSHOPS_BY_TEACHER } from '@/graphql/queries/GetWorkshopsByTeacher';
import { useMutation, useQuery } from '@apollo/client';
import { Fragment, useState } from 'react';
import CloseWorkshopModal from '@/components/CloseWorkshopModal/CloseWorkshopModal';
import Loader from '@/components/Loader/Loaader';
import { CLOSE_WORKSHOP } from '@/graphql/mutations/CloseWorkshop';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';

export default function MyWorkshopPage() {
  const [activeWorkshopId, setActiveWorkshopId] = useState<string | null>(null);
  const [showClosed, setShowClosed] = useState<boolean>(false);
  const [closeWorkshop] = useMutation(CLOSE_WORKSHOP);
  const { user } = useUser();
  const { data, loading, refetch } = useQuery(GET_WORKSHOPS_BY_TEACHER, {
    variables: { userId: user?.id },
  });

  async function handleCloseWorkshop(studentIds: string[]) {
    try {
      await closeWorkshop({
        variables: { studentIds, workshopId: activeWorkshopId },
      });
      refetch();
      setActiveWorkshopId(null);
    } catch {
      console.log('Error');
    }
  }

  const activeWorkshops = [...(data?.workshopsByTeacher ?? [])].filter((w) => !w.isClosed);
  const closedWorkshops = [...(data?.workshopsByTeacher ?? [])].filter((w) => w.isClosed);

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
      <Section>
        <Title>Мои мастерклассы</Title>
      </Section>
      {activeWorkshops.map((workshop: WorkshopType) => (
        <Fragment key={workshop.id}>
          <Workshop
            name={workshop.name}
            description={workshop.description}
            students={workshop.students ?? []}
            maxStudentAmount={workshop.maxStudents}
            place={workshop.place?.name}
            teacher={workshop.teacher?.name}
            maxAge={workshop.maxAge}
            toClose
            isClosed={workshop.isClosed}
            handleJoin={() => setActiveWorkshopId(workshop.id)}
          />

          {activeWorkshopId === workshop.id && (
            <CloseWorkshopModal
              students={workshop.students ?? []}
              onSubmit={handleCloseWorkshop}
              onClose={() => setActiveWorkshopId(null)}
            />
          )}
        </Fragment>
      ))}
      <PrimaryButton onClick={() => setShowClosed((prev) => !prev)}>
        {showClosed ? 'Скрыть закрытые' : 'Показать закрытые'}
      </PrimaryButton>

      {showClosed &&
        closedWorkshops.map((workshop: WorkshopType) => (
          <Fragment key={workshop.id}>
            <Workshop
              name={workshop.name}
              description={workshop.description}
              students={workshop.students ?? []}
              maxStudentAmount={workshop.maxStudents}
              place={workshop.place?.name}
              teacher={workshop.teacher?.name}
              maxAge={workshop.maxAge}
              toClose
              isClosed={workshop.isClosed}
              handleJoin={() => setActiveWorkshopId(workshop.id)}
            />
          </Fragment>
        ))}
    </CenteredContainer>
  );
}
