'use client';

import { useUser } from '@/contexts/UserContext';
import styles from './style.module.scss';
import { useQuery } from '@apollo/client';
import queries from '@/graphql/queries';
import { User } from '@/app/types';
import Section from '@/components/Section/Section';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import UserBadge from '@/components/UserBadge/UserBadge';
import EditStudentModal from '@/components/EditStudentModal/EditStudentModal';
import { useState } from 'react';
import Loader from '@/components/Loader/Loaader';

function TeacherGroupPage() {
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const { user } = useUser();
  const { data, loading, refetch } = useQuery(queries.GET_STUDENTS_BY_GROUP_ID, {
    variables: { groupId: user?.group?.id },
    skip: !user?.group?.id,
  });
  console.log(user);

  const handleStudentClick = (student: User) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedStudent(null);
  };

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
        {data?.usersByGroup.map((student: User) => (
          <UserBadge
            key={student.id}
            name={student.name}
            onClick={() => handleStudentClick(student)}
          />
        ))}

        {showEditModal && selectedStudent && (
          <EditStudentModal
            student={selectedStudent}
            onClose={handleCloseModal}
            onSubmit={refetch}
          />
        )}
      </Section>
    </CenteredContainer>
  );
}

export default TeacherGroupPage;
