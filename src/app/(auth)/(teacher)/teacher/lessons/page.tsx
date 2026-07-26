'use client';
import { User } from '@/app/types';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import CloseLessonModal from '@/components/CloseLessonModal/CloseLessonModal';
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

const MAX_BACKDATE_DAYS = 7;

type ClassItem = {
  id: string;
  name: string;
  closedDates: string[];
  place?: { name: string };
  teachers: User[];
  students: User[];
};

type ActiveLesson = {
  classId: string;
  isBackdated: boolean;
};

function formatLocalDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

// Все прошедшие дни окна: уже закрытые показываем неактивными, а не прячем
function pastDateOptions(closedDates: string[]) {
  const options = [];

  for (let daysAgo = 1; daysAgo <= MAX_BACKDATE_DAYS; daysAgo++) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - daysAgo);

    const value = formatLocalDate(date);

    options.push({
      value,
      label: date.toLocaleDateString('ru-RU', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
      }),
      disabled: closedDates.includes(value),
    });
  }

  return options;
}

export default function LessonsPage() {
  // От isBackdated зависит, спрашивает модалка дату или закрывает урок за сегодня
  const [activeLesson, setActiveLesson] = useState<ActiveLesson | null>(null);
  const { user } = useUser();
  const { data, loading, refetch } = useQuery(GET_CLASSES_BY_TEACHER, {
    variables: { teacherId: user?.id },
    skip: !user?.id,
  });

  const [closeLesson] = useGlobalLoadingMutation(CLOSE_LESSON);

  async function handleCloseLesson(studentIds: string[], date?: string) {
    try {
      await closeLesson({ classId: activeLesson?.classId, teacherId: user?.id, studentIds, date });
      refetch();
      setActiveLesson(null);
    } catch {
      console.error('Error');
    }
  }

  const classes: ClassItem[] = data?.classesByTeacher ?? [];
  const today = formatLocalDate(new Date());

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
      {classes.length <= 0 && (
        <Section>
          <Subtitle noMargin>Уроков нет</Subtitle>
        </Section>
      )}
      {classes.map((classItem) => {
        const isClosedToday = classItem.closedDates.includes(today);
        const pastDates = pastDateOptions(classItem.closedDates);
        const hasMissedDates = pastDates.some((option) => !option.disabled);

        return (
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

                {isClosedToday ? (
                  <>
                    <div className={styles['lesson-card__status']}>Урок закрыт</div>
                    {hasMissedDates && (
                      <PrimaryButton
                        onClick={() =>
                          setActiveLesson({ classId: classItem.id, isBackdated: true })
                        }
                      >
                        Начислить за прошлую дату
                      </PrimaryButton>
                    )}
                  </>
                ) : (
                  <PrimaryButton
                    onClick={() => setActiveLesson({ classId: classItem.id, isBackdated: false })}
                  >
                    Завершить урок
                  </PrimaryButton>
                )}
              </div>
            </Section>

            {activeLesson?.classId === classItem.id && (
              <CloseLessonModal
                title={activeLesson.isBackdated ? 'Начислить за прошлую дату' : 'Завершить урок'}
                students={classItem.students}
                dateOptions={activeLesson.isBackdated ? pastDates : undefined}
                onSubmit={handleCloseLesson}
                onClose={() => setActiveLesson(null)}
              />
            )}
          </Fragment>
        );
      })}
    </CenteredContainer>
  );
}
