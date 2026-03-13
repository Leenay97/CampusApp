'use client';
import { Workshop as WorkshopType } from '@/app/types';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Section from '@/components/Section/Section';
import Title from '@/components/Title/Title';
import Workshop from '@components/Workshop/Workshop';
import { useUser } from '@/contexts/UserContext';
import { GET_WORKSHOPS_BY_TEACHER } from '@/graphql/queries/GetWorkshopsByTeacher';
import { useQuery } from '@apollo/client';
import { Fragment, useState } from 'react';
import CloseWorkshopModal from '@/components/CloseWorkshopModal/CloseWorkshopModal';
import Loader from '@/components/Loader/Loaader';

export default function MyWorkshopPage() {
  const [activeWorkshopId, setActiveWorkshopId] = useState<string | null>(null);
  const { user } = useUser();
  const { data, loading } = useQuery(GET_WORKSHOPS_BY_TEACHER, {
    variables: { userId: user?.id },
  });

  function handleCloseWorkshop() {
    setActiveWorkshopId(null);
  }
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
        <Title>Открытые мастерклассы</Title>
        {data?.workshopsByTeacher.map((workshop: WorkshopType) => (
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
              handleJoin={() => setActiveWorkshopId(workshop.id)}
            />

            {activeWorkshopId === workshop.id && (
              <CloseWorkshopModal
                students={workshop.students ?? []}
                onClose={() => setActiveWorkshopId(null)}
              />
            )}
          </Fragment>
        ))}
      </Section>
    </CenteredContainer>
  );
}
