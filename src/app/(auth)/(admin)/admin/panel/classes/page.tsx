'use client';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import CreateClassModal from '@/components/CreateClassModal/CreateClassModal';
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
  place?: { name: string };
};

export default function ClassesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { loading, data, refetch } = useQuery(GET_CLASSES);

  function handleSubmit() {
    setIsModalOpen(false);
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
    <CenteredContainer wide noPadding>
      <Section>
        <Title>Языковые группы</Title>
        <PrimaryButton onClick={() => setIsModalOpen(true)}>Добавить класс</PrimaryButton>
        {isModalOpen && (
          <CreateClassModal onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} />
        )}
        {data?.classes && data.classes.length > 0 ? (
          <div className={styles['class-list']}>
            {data.classes.map((classItem: ClassItem) => (
              <div key={classItem.id} className={styles['class-card']}>
                <div className={styles['class-card__title']}>{classItem.name}</div>
                <div className={styles['class-card__row']}>
                  Учителя: {classItem.teachers.map((teacher) => teacher.name).join(', ') || '—'}
                </div>
                <div className={styles['class-card__row']}>
                  Место: {classItem.place?.name ?? '—'}
                </div>
                <div className={styles['class-card__row']}>
                  Студенты ({classItem.students.length}):{' '}
                  {classItem.students
                    .map((student) => student.russianName || student.name)
                    .join(', ') || '—'}
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
