'use client';

import { AddTeacher } from '@components/AddTeacher/AddTeacher';
import { TeachersList } from '@components/TeachersList/TeachersList';
import { useQuery } from '@apollo/client';
import { queries } from '@graphql/queries/index';
import { AddGroup } from '@components/AddGroup/AddGroup';
import { GroupsList } from '@components/GroupsList/GroupsList';
import { mutations } from '@graphql/mutations';
import { useMutation } from '@apollo/client';
import Modal from '@components/Modal/Modal';
import { useEffect, useState } from 'react';
import styles from './style.module.scss';
import { InputField } from '@/components/InputField/InputField';

function AdminPage() {
  const [deleteType, setDeleteType] = useState<'teacher' | 'group' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalText, setModalText] = useState({
    text: '',
    description: '',
  });
  const [selectedIdToDelete, setSelectedIdToDelete] = useState<string | null>(null);
  const [password, setPassword] = useState<string>('');
  const accountLevel = 'ADMIN';
  const [deleteUser] = useMutation(mutations.DELETE_USER);
  const [deleteGroup] = useMutation(mutations.DELETE_GROUP);

  const {
    loading: teachersLoading,
    data: teachers,
    refetch: refetchTeachers,
  } = useQuery(queries.GET_TEACHERS);

  const {
    loading: groupsLoading,
    data: groups,
    refetch: refetchGroups,
  } = useQuery(queries.GET_GROUPS);

  const handleRefetch = () => {
    refetchTeachers();
    refetchGroups();
  };

  const modalSubmit = async () => {
    if (!selectedIdToDelete) return;
    try {
      if (deleteType === 'teacher') {
        await deleteUser({ variables: { id: selectedIdToDelete } });
      }

      if (deleteType === 'group') {
        await deleteGroup({ variables: { id: selectedIdToDelete } });
      }

      setIsModalOpen(false);
      setSelectedIdToDelete(null);
      handleRefetch();
    } catch {
      setIsModalOpen(false);
    }
  };

  async function handleDeleteUser(id: string, name: string) {
    setDeleteType('teacher');
    setSelectedIdToDelete(id);
    setModalText({ text: `Ты точно хочешь удалить учителя?`, description: name });
    setIsModalOpen(true);
  }

  async function handleDeleteGroup(id: string, name: string) {
    setDeleteType('group');
    setSelectedIdToDelete(id);
    setModalText({ text: `Ты точно хочешь удалить группу?`, description: name });
    setIsModalOpen(true);
  }

  // if (accountLevel !== 'ADMIN') {
  //   window.location.href = '/';
  //   return null;
  // }

  console.log(process.env.NEXT_PUBLIC_PROHIBITED_SECTION_PASSWORD);

  //TEST

  useEffect(() => {
    console.log(
      'Prohibited section password:',
      process.env.NEXT_PUBLIC_PROHIBITED_SECTION_PASSWORD,
      password,
    );
  }, [password]);

  return (
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
            <AddTeacher onAdd={handleRefetch} />
            <TeachersList teachers={teachers?.teachers} onDelete={handleDeleteUser} />
            <AddGroup onAdd={handleRefetch} teachers={teachers?.teachers} />
            <GroupsList groups={groups?.groups} onDelete={handleDeleteGroup} />
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
  );
}

export default AdminPage;
