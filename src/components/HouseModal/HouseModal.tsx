'use client';
import { memo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './HouseModal.module.scss';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@components/SecondaryButton/SecondaryButton';
import Title from '../Title/Title';
import Subtitle from '../Subtitle/Subtitle';
import ActionButton from '@components/ActionButton/ActionButton';
import { CustomSelect } from '../CustomSelect/CustomSelect';
import { useQuery } from '@apollo/client';
import { GET_ACTIVE_SEASON } from '@/graphql/queries/GetActiveSeason';
import { GET_HOUSE } from '@/graphql/queries/GetHouse';
import { GET_STUDENTS_BY_GROUP_ID } from '@/graphql/queries/GetStudentsByGroupId';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { UPDATE_USER } from '@/graphql/mutations/UpdateUser';
import UserBadge from '../UserBadge/UserBadge';
import { User } from '@/app/types';
import { useUser } from '@/contexts/UserContext';
import GradeSection from '../GradeSection/GradeSection';
import { UPDATE_HOUSE } from '@/graphql/mutations/UpdateHouse';

type ModalProps = {
  id: string;
  number: string;
  onClose: () => void;
};

function HouseModal({ id, number, onClose }: ModalProps) {
  const [selectedGroup, setSelectedGroup] = useState({ id: '', name: '' });
  const [selectedStudent, setSelectedStudent] = useState({ id: '', name: '' });
  const [grade, setGrade] = useState(0);
  const [updateUser] = useGlobalLoadingMutation(UPDATE_USER);
  const [updateHouse] = useGlobalLoadingMutation(UPDATE_HOUSE);
  const {
    data: houseData,
    loading: houseLoading,
    refetch,
  } = useQuery(GET_HOUSE, { variables: { id } });
  const [addStudentForm, setAddStudentForm] = useState<boolean>(false);
  const { data: groupsData, loading: groupsLoading } = useQuery(GET_ACTIVE_SEASON);
  const { data: studentsData } = useQuery(GET_STUDENTS_BY_GROUP_ID, {
    variables: { groupId: selectedGroup.id },
    skip: !selectedGroup.id,
  });
  const { user } = useUser();

  if (typeof window === 'undefined') return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  function handleToggleEditForm() {
    setAddStudentForm((prev) => !prev);
  }

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  function handleChangeGroup({ id, name }: { id: string; name: string }) {
    setSelectedGroup({ id, name });
    setSelectedStudent({ id: '', name: '' });
  }

  async function handleAddStudent() {
    try {
      await updateUser({ id: selectedStudent.id, houseId: id });
      setAddStudentForm(false);
      refetch();
    } catch (err) {
      console.log(err);
    }
  }

  async function handleGrade(value: number) {
    try {
      await updateHouse({ id, grade: value });
      setGrade(value);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    setGrade(houseData?.house?.grade);
  }, [houseData?.house?.grade]);

  return createPortal(
    <div className={styles['house-modal']} onClick={handleOverlayClick}>
      <div className={styles['house-modal__content']} onClick={handleContentClick}>
        <div className={styles['house-modal__header']}>
          <Title noMargin>Домик #{number}</Title>
          <div className={styles['close-button']} onClick={onClose}>
            &times;
          </div>
        </div>
        <div className={styles['house-modal__body']}>
          {user?.userLevel === 'ADMIN' && (
            <GradeSection onChange={handleGrade} selectedGrade={grade} />
          )}
          <div className={styles['house-modal__row']}>
            <Subtitle noMargin>Студенты</Subtitle>
            <ActionButton type="ADD" onClick={handleToggleEditForm} />
          </div>
          {!addStudentForm && houseData?.house?.users.length > 0 && (
            <div className={styles['house-modal__students']}>
              {houseData.house.users.map((user: User) => (
                <UserBadge key={user.id} name={user.name} group={user?.group?.name || ''} />
              ))}
            </div>
          )}
          {houseData?.house?.users.length === 0 && <Subtitle>Пусто</Subtitle>}
          {addStudentForm && (
            <div>
              <Subtitle>Группа</Subtitle>
              <CustomSelect
                key={`group-select-${selectedGroup.id}`}
                items={groupsData?.activeSeason?.groups || []}
                onChange={handleChangeGroup}
                initValue={selectedGroup.name}
              />
              {studentsData?.students?.length > 0 ? (
                <>
                  <Subtitle>Студент</Subtitle>
                  <CustomSelect
                    key={`student-select-${selectedStudent.id}`}
                    items={studentsData?.students || []}
                    onChange={setSelectedStudent}
                    initValue={selectedStudent.name}
                  />
                </>
              ) : (
                <Subtitle>Студентов нет</Subtitle>
              )}
            </div>
          )}
        </div>
        <div className={styles['house-modal__footer']}>
          <SecondaryButton onClick={addStudentForm ? handleToggleEditForm : onClose}>
            {addStudentForm ? 'Отмена' : 'Выйти'}
          </SecondaryButton>
          {addStudentForm && <PrimaryButton onClick={handleAddStudent}>Добавить</PrimaryButton>}
        </div>
      </div>
    </div>,
    modalRoot,
  );
}

export default memo(HouseModal);
