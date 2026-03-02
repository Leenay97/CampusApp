'use client';

import { AddTeacher } from '@components/AddTeacher/AddTeacher';
import { TeachersList } from '@components/TeachersList/TeachersList';
import { useQuery } from '@apollo/client';
import { queries } from '@graphql/queries/index';
import { mutations } from '@graphql/mutations';
import { useMutation } from '@apollo/client';
import Modal from '@components/Modal/Modal';
import styles from './style.module.scss';
import { InputField } from '@/components/InputField/InputField';
import { useState } from 'react';
import { AuthGuard } from '@/auth/AuthGuard';

function GroupsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalText, setModalText] = useState({
    text: '',
    description: '',
  });
  const [selectedIdToDelete, setSelectedIdToDelete] = useState<string | null>(null);
  const [password, setPassword] = useState<string>('');
  const [deleteUser] = useMutation(mutations.DELETE_USER);
  const [deleteGroup] = useMutation(mutations.DELETE_GROUP);

  const {
    loading: teachersLoading,
    data: teachers,
    refetch: refetchTeachers,
  } = useQuery(queries.GET_TEACHERS);

  const handleRefetch = () => {
    refetchTeachers();
  };

  const modalSubmit = async () => {
    if (!selectedIdToDelete) return;
    try {
      await deleteUser({ variables: { id: selectedIdToDelete } });
      setIsModalOpen(false);
      setSelectedIdToDelete(null);
      handleRefetch();
    } catch {
      setIsModalOpen(false);
    }
  };

  async function handleDeleteUser(id: string, name: string) {
    setSelectedIdToDelete(id);
    setModalText({ text: `Ты точно хочешь удалить учителя?`, description: name });
    setIsModalOpen(true);
  }

  return (
    <AuthGuard allowedRoles={['TEACHER']}>
      <div className="centered-container">
        <div className="flex-container">
          <h1 className="title">Admin Dashboard</h1>
          <div className={styles['prohibited-section']}>
            <div className={styles['prohibited-section__header']}>
              <h2 className="subtitle">Prohibited Actions</h2>
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
              <TeachersList teachers={teachers?.teachers} onDelete={handleDeleteUser} />
            </div>
          </div>
        </div>
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
      </div>
    </AuthGuard>
  );
}

export default GroupsPage;
