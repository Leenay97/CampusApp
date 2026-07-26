'use client';
import { JSX } from 'react';
import Workshop from '@components/Workshop/Workshop';
import style from './SportPage.module.scss';
import { useQuery } from '@apollo/client';
import queries from '@/graphql/queries';
import { Workshop as WorkshopType } from '@/app/types';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Section from '@/components/Section/Section';
import Loader from '@/components/Loader/Loaader';
import EmptyState from '@/components/EmptyState/EmptyState';

export default function SportPage(): JSX.Element {
  const { data, loading } = useQuery(queries.GET_TODAY_WORKSHOPS, {
    variables: { isSport: true },
  });

  if (loading)
    return (
      <CenteredContainer>
        <Section>
          <Loader />
        </Section>
      </CenteredContainer>
    );

  const workshopsToShow = data?.todayWorkshops;

  if (!workshopsToShow?.length) {
    return (
      <CenteredContainer>
        <EmptyState
          image="/img/sport.png"
          title="Sport Time еще нет"
          subtitle="Загляни сюда чуть позже"
        />
      </CenteredContainer>
    );
  }

  return (
    <CenteredContainer>
      <div className={style['workshops-wrapper']}>
        {workshopsToShow.map((workshop: WorkshopType) => (
          <Workshop
            key={workshop.id}
            name={workshop.name}
            description={workshop.description}
            image={workshop.image}
            students={[]}
            maxStudentAmount={0}
            place={workshop.place.name}
            teacher={workshop.teacher.name}
            avatar={workshop.teacher.photoUrl}
            maxAge={workshop.maxAge}
            isSport
            noButtons
          />
        ))}
      </div>
    </CenteredContainer>
  );
}
