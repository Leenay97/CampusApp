'use client';
import { AddTeacher } from '@/components/AddTeacher/AddTeacher';
import Modal from '@/components/Modal/Modal';
import { TeachersList } from '@/components/TeachersList/TeachersList';
import { mutations } from '@/graphql/mutations';
import { queries } from '@/graphql/queries';
import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';

export default function TeachersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const {
    loading: teachersLoading,
    data: teachersData,
    refetch: refetchTeachers,
  } = useQuery(queries.GET_TEACHERS);

  const [deleteTeacher] = useMutation(mutations.DELETE_USER);

  function openModal(teacher: Teacher | null) {
    setTeacherToDelete(teacher);
    setIsModalOpen(true);
  }

  const handleDeleteTeacher = async () => {
    if (!teacherToDelete) return;

    try {
      await deleteTeacher({ variables: { id: teacherToDelete.id } });
      setTeacherToDelete(null);
      setIsModalOpen(false);
      refetchTeachers();
    } catch (err) {
      console.error('Error deleting teacher:', err);
    }
  };

  return (
    <>
      <div className="centered-container">
        <div className="section">
          <AddTeacher onAdd={refetchTeachers} />
          <TeachersList
            teachers={teachersData?.teachers}
            isLoading={teachersLoading}
            onDelete={openModal}
          />
        </div>
      </div>
      {isModalOpen && (
        <Modal
          text={'Удалить учителя?'}
          description={`Вы уверены, что хотите удалить учителя ${teacherToDelete?.name}?`}
          onSubmit={handleDeleteTeacher}
          onClose={() => setIsModalOpen(false)}
          hasCancel
          onCancel={() => setIsModalOpen(false)}
          isOpen={isModalOpen}
        />
      )}
    </>
  );
}
