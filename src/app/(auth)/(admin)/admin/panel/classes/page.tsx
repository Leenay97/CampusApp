'use client';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import CreateClassModal from '@/components/CreateClassModal/CreateClassModal';
import Loader from '@/components/Loader/Loaader';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import Section from '@/components/Section/Section';
import Title from '@/components/Title/Title';
import { GET_CLASSES } from '@/graphql/queries/GetClasses';
import { useQuery } from '@apollo/client';
import { useState } from 'react';

export default function ClassesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { loading, data, refetch } = useQuery(GET_CLASSES);

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
        <Title>Classes</Title>
        <PrimaryButton onClick={() => setIsModalOpen(true)}>Добавить класс</PrimaryButton>
        {isModalOpen && (
          <CreateClassModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={refetch}
          />
        )}
        {data?.classes && data.classes.length > 0 ? (
          <ul>
            {data.classes.map((classItem) => (
              <li key={classItem.id}>{classItem.name}</li>
            ))}
          </ul>
        ) : (
          <p>No classes found.</p>
        )}
      </Section>
    </CenteredContainer>
  );
}
