'use client';
import { User } from '@/app/types';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import CloseWorkshopModal from '@/components/CloseWorkshopModal/CloseWorkshopModal';
import Loader from '@/components/Loader/Loaader';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import Section from '@/components/Section/Section';
import Subtitle from '@/components/Subtitle/Subtitle';
import Title from '@/components/Title/Title';
import { useUser } from '@/contexts/UserContext';
import { CLOSE_LESSON } from '@/graphql/mutations/CloseLesson';
import { GET_CLASSES_BY_TEACHER } from '@/graphql/queries/GetClassesByTeacher';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { useQuery } from '@apollo/client';
import { Fragment, useState } from 'react';
import styles from './LessonsPage.module.scss';

type ClassItem = {
  id: string;
  name: string;
  isClosedToday: boolean;
  place?: { name: string };
  teachers: User[];
  students: User[];
};

export default function LessonsPage() {
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const { user } = useUser();
  const { data, loading, refetch } = useQuery(GET_CLASSES_BY_TEACHER, {
    variables: { teacherId: user?.id },
    skip: !user?.id,
  });

  const [closeLesson] = useGlobalLoadingMutation(CLOSE_LESSON);

  async function handleCloseLesson(studentIds: string[]) {
    try {
      await closeLesson({ classId: activeClassId, teacherId: user?.id, studentIds });
      refetch();
      setActiveClassId(null);
    } catch {
      console.error('Error');
    }
  }

  // Закрытый урок исчезает до полуночи, потом класс снова появляется в списке
  const openClasses = (data?.classesByTeacher ?? []).filter(
    (classItem: ClassItem) => !classItem.isClosedToday,
  );

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
        <Title noMargin>Lessons</Title>
      </Section>
      {openClasses.length <= 0 && (
        <Section>
          <Subtitle noMargin>Уроков на сегодня нет</Subtitle>
        </Section>
      )}
      {openClasses.map((classItem: ClassItem) => (
        <Fragment key={classItem.id}>
          <Section>
            <div className={styles['lesson-card']}>
              <Subtitle noMargin>{classItem.name}</Subtitle>
              <div className={styles['lesson-card__row']}>
                Место: {classItem.place?.name ?? '—'}
              </div>
              <div className={styles['lesson-card__row']}>
                Студенты ({classItem.students.length}):{' '}
                {classItem.students.map((student) => student.name).join(', ') || '—'}
              </div>
              <PrimaryButton onClick={() => setActiveClassId(classItem.id)}>
                Завершить урок
              </PrimaryButton>
            </div>
          </Section>

          {activeClassId === classItem.id && (
            <CloseWorkshopModal
              title="Завершить урок"
              students={classItem.students}
              onSubmit={handleCloseLesson}
              onClose={() => setActiveClassId(null)}
            />
          )}
        </Fragment>
      ))}
    </CenteredContainer>
  );
}
