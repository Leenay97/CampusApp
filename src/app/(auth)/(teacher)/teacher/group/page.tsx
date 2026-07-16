'use client';

import { useUser } from '@/contexts/UserContext';
import styles from './TeacherGroupPage.module.scss';
import { useQuery } from '@apollo/client';
import queries from '@/graphql/queries';
import mutations from '@/graphql/mutations';
import { User } from '@/app/types';
import Section from '@/components/Section/Section';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import UserBadge from '@/components/UserBadge/UserBadge';
import EditStudentModal from '@/components/EditStudentModal/EditStudentModal';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import { AddStudent } from '@/components/AddStudent/AddStudent';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import { useState } from 'react';
import Loader from '@/components/Loader/Loaader';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';

function TeacherGroupPage() {
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteUnregisteredModal, setShowDeleteUnregisteredModal] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const { user } = useUser();
  const { data, loading, refetch } = useQuery(queries.GET_STUDENTS_BY_GROUP_ID, {
    variables: { groupId: user?.group?.id },
    skip: !user?.group?.id,
  });
  const [deleteUnregisteredStudents] = useGlobalLoadingMutation(
    mutations.DELETE_UNREGISTERED_STUDENTS,
  );

  const students: User[] = data?.usersByGroup ?? [];
  const unregisteredStudents = students.filter((student) => !student.name);
  const sortedStudents = [...students].sort((a, b) => Number(!a.name) - Number(!b.name));

  function handleStudentClick(student: User) {
    setSelectedStudent(student);
    setShowEditModal(true);
  }

  function handleCloseModal() {
    setShowEditModal(false);
    setSelectedStudent(null);
  }

  async function handleDeleteUnregistered() {
    if (!user?.group?.id) return;
    try {
      await deleteUnregisteredStudents({ groupId: user.group.id });
      setShowDeleteUnregisteredModal(false);
      refetch();
    } catch (err) {
      console.error(err);
    }
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
    <CenteredContainer>
      <Section>
        <div className="">
          Твоя группа <span className={styles['group-logo']}>{user?.group?.name}</span>
        </div>
        <AddStudent groupId={user?.group?.id} onAdd={refetch} />
        {sortedStudents.map((student: User) => (
          <UserBadge
            key={student.id}
            name={student.name || student.russianName || '—'}
            secondName={student.name ? student.russianName : undefined}
            isUnregistered={!student.name}
            onClick={() => handleStudentClick(student)}
          />
        ))}

        {unregisteredStudents.length > 0 && (
          <PrimaryButton onClick={() => setShowDeleteUnregisteredModal(true)}>
            Удалить незарегистрированных
          </PrimaryButton>
        )}

        {showEditModal && selectedStudent && (
          <EditStudentModal
            student={selectedStudent}
            onClose={handleCloseModal}
            onSubmit={refetch}
          />
        )}

        {showDeleteUnregisteredModal && (
          <ConfirmModal
            title="Удалить незарегистрированных студентов?"
            confirmText="Удалить"
            onConfirm={handleDeleteUnregistered}
            onClose={() => setShowDeleteUnregisteredModal(false)}
          >
            Будет удалено студентов: {unregisteredStudents.length}. Это действие нельзя отменить.
          </ConfirmModal>
        )}
      </Section>
    </CenteredContainer>
  );
}

export default TeacherGroupPage;
