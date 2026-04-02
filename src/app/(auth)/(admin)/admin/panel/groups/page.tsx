'use client';

import { AddTeacher } from '@/components/AddTeacher/AddTeacher';
import { useQuery } from '@apollo/client';
import { queries } from '@graphql/queries/index';
import Modal from '@components/Modal/Modal';
import styles from './GroupsPage.module.scss';
import { InputField } from '@/components/InputField/InputField';
import { useState } from 'react';
import { AuthGuard } from '@/auth/AuthGuard';
import { List } from '@/components/List/List';
import { User } from '@/app/types';
import Section from '@/components/Section/Section';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Subtitle from '@/components/Subtitle/Subtitle';
import Loader from '@/components/Loader/Loaader';
import { DELETE_USER } from '@/graphql/mutations/DeleteUser';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';

function GroupsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalText, setModalText] = useState({
    text: '',
    description: '',
  });
  const [selectedIdToDelete, setSelectedIdToDelete] = useState<string | null>(null);
  const [password, setPassword] = useState<string>('');
  const [deleteUser] = useGlobalLoadingMutation(DELETE_USER);

  const {
    loading: teachersLoading,
    data: teachers,
    refetch: refetchTeachers,
  } = useQuery(queries.GET_TEACHERS);

  function handleRefetch() {
    refetchTeachers();
  }

  async function modalSubmit() {
    if (!selectedIdToDelete) return;
    try {
      await deleteUser({ id: selectedIdToDelete });
      setIsModalOpen(false);
      setSelectedIdToDelete(null);
      handleRefetch();
    } catch {
      setIsModalOpen(false);
    }
  }

  async function handleDeleteUser(user: User | null) {
    if (!user) return;
    setSelectedIdToDelete(user.id);
    setModalText({
      text: `Ты точно хочешь удалить учителя?`,
      description: user.name ?? user.russianName,
    });
    setIsModalOpen(true);
  }

  if (teachersLoading)
    return (
      <CenteredContainer>
        <Section>
          <Loader />
        </Section>
      </CenteredContainer>
    );

  return (
    <AuthGuard allowedRoles={['TEACHER']}>
      <CenteredContainer noPadding>
        <Section>
          <div className={styles['prohibited-section__header']}>
            <Subtitle>Prohibited Actions</Subtitle>
            <div>Введите пароль чтобы открыть секцию.</div>
            <InputField value={password} onChange={setPassword} width="200px" />
          </div>
          <div
            className={
              password == process.env.NEXT_PUBLIC_PROHIBITED_SECTION_PASSWORD
                ? styles['prohibited-section__content']
                : styles['prohibited-section__content--hidden']
            }
          >
            <h1>Добавить учителя</h1>
            <AddTeacher onAdd={handleRefetch} />
            <List<User>
              items={teachers?.teachers}
              isLoading={teachersLoading}
              onDelete={handleDeleteUser}
            />
          </div>
        </Section>
        {isModalOpen && (
          <Modal
            text={modalText.text}
            description={modalText.description}
            onSubmit={modalSubmit}
            onClose={() => setIsModalOpen(false)}
            hasCancel
            onCancel={() => setIsModalOpen(false)}
            isOpen={isModalOpen}
          />
        )}
      </CenteredContainer>
    </AuthGuard>
  );
}

export default GroupsPage;
