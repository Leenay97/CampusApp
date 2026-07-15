'use client';
import { User } from '@/app/types';
import { AddTeacher } from '@/components/AddTeacher/AddTeacher';
import Modal from '@/components/Modal/Modal';
import { List } from '@/components/List/List';
import { mutations } from '@/graphql/mutations';
import { queries } from '@/graphql/queries';
import { useQuery } from '@apollo/client';
import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import Section from '@/components/Section/Section';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import ModalHeader from '@/components/Modal/ModalHeader';
import ModalBody from '@/components/Modal/ModalBody';
import ModalFooter from '@/components/Modal/ModalFooter';
import SecondaryButton from '@/components/SecondaryButton/SecondaryButton';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import Loader from '@/components/Loader/Loaader';

export default function TeachersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<User | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const {
    loading: teachersLoading,
    data: teachersData,
    refetch: refetchTeachers,
  } = useQuery(queries.GET_TEACHERS);

  const { data: tokenData, loading: tokenLoading } = useQuery(
    queries.GET_TEACHER_REGISTRATION_TOKEN,
    { skip: !isQrModalOpen },
  );
  const registrationUrl = tokenData?.teacherRegistrationToken
    ? `${window.location.origin}/register-teachers?token=${tokenData.teacherRegistrationToken}`
    : '';

  const [deleteTeacher] = useGlobalLoadingMutation(mutations.DELETE_USER);

  function openModal(user: User | null) {
    setTeacherToDelete(user);
    setIsModalOpen(true);
  }

  async function handleDeleteTeacher() {
    if (!teacherToDelete) return;

    try {
      await deleteTeacher({ id: teacherToDelete.id });
      setTeacherToDelete(null);
      setIsModalOpen(false);
      refetchTeachers();
    } catch (err) {
      console.error('Error deleting teacher:', err);
    }
  }

  return (
    <>
      <CenteredContainer noPadding>
        <Section>
          <List<User>
            title="Учителя"
            items={teachersData?.teachers}
            isLoading={teachersLoading}
            onDelete={openModal}
          />
          <AddTeacher onAdd={refetchTeachers} />
          <SecondaryButton onClick={() => setIsQrModalOpen(true)}>
            QR для регистрации учителя
          </SecondaryButton>
        </Section>
      </CenteredContainer>
      {isQrModalOpen && (
        <Modal onClose={() => setIsQrModalOpen(false)}>
          <ModalHeader title="QR для регистрации учителя" onClose={() => setIsQrModalOpen(false)} />
          <ModalBody>
            {tokenLoading ? (
              <Loader />
            ) : (
              <QRCodeCanvas style={{ margin: '0 auto' }} value={registrationUrl} size={200} />
            )}
          </ModalBody>
        </Modal>
      )}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <ModalHeader title="Удалить учителя?" onClose={() => setIsModalOpen(false)} />
          <ModalBody>{`Вы уверены, что хотите удалить учителя ${teacherToDelete?.name}?`}</ModalBody>
          <ModalFooter>
            <SecondaryButton onClick={() => setIsModalOpen(false)}>Отмена</SecondaryButton>
            <PrimaryButton onClick={handleDeleteTeacher}>Удалить</PrimaryButton>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
}
