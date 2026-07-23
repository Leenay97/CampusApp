'use client';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import CreateClassModal from '@/components/CreateClassModal/CreateClassModal';
import EditButton from '@/components/EditButton/EditButton';
import Loader from '@/components/Loader/Loaader';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import Section from '@/components/Section/Section';
import Title from '@/components/Title/Title';
import { User } from '@/app/types';
import { GET_CLASSES } from '@/graphql/queries/GetClasses';
import { useQuery } from '@apollo/client';
import { useState } from 'react';
import styles from './ClassesPage.module.scss';

type ClassItem = {
  id: string;
  name: string;
  teachers: User[];
  students: User[];
  place?: { id: string; name: string };
};

type ModalState = { mode: 'create' } | { mode: 'edit'; classItem: ClassItem };

export default function ClassesPage() {
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const { loading, data, refetch } = useQuery(GET_CLASSES);

  function handleSubmit() {
    setModalState(null);
    refetch();
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
    <CenteredContainer noPaddingTop>
      <Section>
        <Title>Языковые группы</Title>
        <PrimaryButton onClick={() => setModalState({ mode: 'create' })}>
          Добавить класс
        </PrimaryButton>
        {modalState && (
          <CreateClassModal
            classToEdit={modalState.mode === 'edit' ? modalState.classItem : undefined}
            onClose={() => setModalState(null)}
            onSubmit={handleSubmit}
          />
        )}
        {data?.classes && data.classes.length > 0 ? (
          <div className={styles['class-list']}>
            {data.classes.map((classItem: ClassItem) => (
              <div key={classItem.id} className={styles['class-card']}>
                <div className={styles['class-card__title']}>
                  {classItem.name}
                  <EditButton
                    className={styles['class-card__edit']}
                    onClick={() => setModalState({ mode: 'edit', classItem })}
                  />
                </div>
                <div className={styles['class-card__row']}>
                  Учителя: {classItem.teachers.map((teacher) => teacher.name).join(', ') || '—'}
                </div>
                <div className={styles['class-card__row']}>
                  Место: {classItem.place?.name ?? '—'}
                </div>
                <div className={styles['class-card__row']}>
                  Студенты ({classItem.students.length}):{' '}
                  {classItem.students.map((student) => student.name).join(', ') || '—'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Классов пока нет</p>
        )}
      </Section>
    </CenteredContainer>
  );
}
