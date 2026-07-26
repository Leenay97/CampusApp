'use client';
import { User } from '@/app/types';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import CloseLessonModal from '@/components/CloseLessonModal/CloseLessonModal';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import Loader from '@/components/Loader/Loaader';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import Section from '@/components/Section/Section';
import Subtitle from '@/components/Subtitle/Subtitle';
import Title from '@/components/Title/Title';
import { useUser } from '@/contexts/UserContext';
import { CLOSE_LESSON } from '@/graphql/mutations/CloseLesson';
import { GET_ACTIVE_SEASON } from '@/graphql/queries/GetActiveSeason';
import { GET_LESSON_CLASSES } from '@/graphql/queries/GetLessonClasses';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { useQuery } from '@apollo/client';
import { Fragment, useState } from 'react';
import styles from './LessonsPage.module.scss';

const MAX_BACKDATE_DAYS = 15;

type ClassItem = {
  id: string;
  name: string;
  closedDates: string[];
  place?: { name: string };
  teachers: User[];
  students: User[];
};

function sortOwnFirst(classes: ClassItem[], teacherId?: string) {
  return [...classes].sort((first, second) => {
    const isFirstOwn = first.teachers.some((teacher) => teacher.id === teacherId);
    const isSecondOwn = second.teachers.some((teacher) => teacher.id === teacherId);
    if (isFirstOwn !== isSecondOwn) return isFirstOwn ? -1 : 1;
    return first.name.localeCompare(second.name);
  });
}

type ActiveLesson = {
  classId: string;
  isBackdated: boolean;
};

// Урок, который выбрали закрыть: ждёт подтверждения перед начислением коинов
type PendingClose = {
  classId: string;
  className: string;
  studentIds: string[];
  date?: string;
};

function formatLocalDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function formatHumanDate(date: string, today: string) {
  const readable = new Date(`${date}T00:00:00`).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return date === today ? `${readable} (сегодня)` : readable;
}

// Все прошедшие дни окна: уже закрытые показываем неактивными, а не прячем.
// seasonStart отсекает дни до начала сезона — уроков там не было
function pastDateOptions(closedDates: string[], seasonStart?: string) {
  const options = [];

  for (let daysAgo = 1; daysAgo <= MAX_BACKDATE_DAYS; daysAgo++) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - daysAgo);

    const value = formatLocalDate(date);
    if (seasonStart && value < seasonStart) break;

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
  const [pendingClose, setPendingClose] = useState<PendingClose | null>(null);
  const { user } = useUser();
  const { data, loading, refetch } = useQuery(GET_LESSON_CLASSES);
  const { data: seasonData } = useQuery(GET_ACTIVE_SEASON);

  const [closeLesson] = useGlobalLoadingMutation(CLOSE_LESSON);

  // Галочки и дата выбраны — спрашиваем подтверждение, коины начисляем только после него
  function handleSubmitSelection(studentIds: string[], date?: string) {
    const classItem = classes.find((item) => item.id === activeLesson?.classId);
    if (!classItem) return;

    setPendingClose({ classId: classItem.id, className: classItem.name, studentIds, date });
    setActiveLesson(null);
  }

  async function handleConfirmClose() {
    if (!pendingClose) return;

    try {
      await closeLesson({
        classId: pendingClose.classId,
        teacherId: user?.id,
        studentIds: pendingClose.studentIds,
        date: pendingClose.date,
      });
      refetch();
    } catch {
      console.error('Error');
    }
    setPendingClose(null);
  }

  const classes = sortOwnFirst(data?.classes ?? [], user?.id);
  const today = formatLocalDate(new Date());
  // startDate приходит таймстампом-строкой, как на других страницах с датами сезона
  const seasonStartTimestamp = Number(seasonData?.activeSeason?.startDate);
  const seasonStart = seasonStartTimestamp
    ? formatLocalDate(new Date(seasonStartTimestamp))
    : undefined;

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
        const pastDates = pastDateOptions(classItem.closedDates, seasonStart);
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
                  Учителя: {classItem.teachers.map((teacher) => teacher.name).join(', ') || '—'}
                </div>
                {/* <div className={styles['lesson-card__row']}>
                  Студенты ({classItem.students.length}):{' '}
                  {classItem.students.map((student) => student.name).join(', ') || '—'}
                </div> */}

                {isClosedToday ? (
                  <>
                    <div className={styles['lesson-card__status']}>Урок закрыт</div>
                    {hasMissedDates && (
                      <PrimaryButton
                        onClick={() =>
                          setActiveLesson({ classId: classItem.id, isBackdated: true })
                        }
                      >
                        Закрыть прошедший урок
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
                onSubmit={handleSubmitSelection}
                onClose={() => setActiveLesson(null)}
              />
            )}
          </Fragment>
        );
      })}

      {pendingClose && (
        <ConfirmModal
          title="Вы уверены что хотите закрыть урок?"
          confirmText="Закрыть урок"
          onConfirm={handleConfirmClose}
          onClose={() => setPendingClose(null)}
        >
          <div className={styles['confirm-row']}>Класс: {pendingClose.className}</div>
          <div className={styles['confirm-row']}>
            Дата: {formatHumanDate(pendingClose.date ?? today, today)}
          </div>
          <div className={styles['confirm-row']}>Закрывает: {user?.name ?? '—'}</div>
        </ConfirmModal>
      )}
    </CenteredContainer>
  );
}
