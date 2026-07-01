'use client';
import { memo, useEffect, useState } from 'react';
import styles from './HouseModal.module.scss';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@components/SecondaryButton/SecondaryButton';
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
import Loader from '../Loader/Loaader';
import Modal from '../Modal/Modal';
import ModalHeader from '../Modal/ModalHeader';
import ModalBody from '../Modal/ModalBody';
import ModalFooter from '../Modal/ModalFooter';

type ModalProps = {
  id: string;
  number: string;
  onClose: () => void;
};

type GroupSelection = {
  id: string;
  name: string;
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
  const { data: groupsData } = useQuery(GET_ACTIVE_SEASON);
  const { data: studentsData } = useQuery(GET_STUDENTS_BY_GROUP_ID, {
    variables: { groupId: selectedGroup.id },
    skip: !selectedGroup.id,
  });
  const { user } = useUser();

  useEffect(() => {
    /*eslint-disable-next-line react-hooks/set-state-in-effect*/
    setGrade(houseData?.house?.grade);
  }, [houseData?.house?.grade]);

  function handleToggleEditForm() {
    setAddStudentForm((prev) => !prev);
  }

  function handleChangeGroup({ id, name }: GroupSelection) {
    setSelectedGroup({ id, name });
    setSelectedStudent({ id: '', name: '' });
  }

  async function handleAddStudent() {
    try {
      await updateUser({ id: selectedStudent.id, houseId: id });
      setAddStudentForm(false);
      refetch();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleGrade(value: number) {
    try {
      await updateHouse({ id, grade: value });
      setGrade(value);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Modal onClose={onClose} className={styles['house-modal__content']}>
      <ModalHeader onClose={onClose} title={`Домик #${number}`} />
      <ModalBody>
        {houseLoading && <Loader />}
        {!houseLoading && (
          <>
            {user?.userLevel === 'ADMIN' && (
              <GradeSection onChange={handleGrade} selectedGrade={grade} />
            )}
            <div className={styles['house-modal__row']}>
              <Subtitle noMargin>Студенты</Subtitle>
              {(user?.userLevel === 'ADMIN' || user?.userLevel === 'TEACHER') && (
                <ActionButton type="ADD" onClick={handleToggleEditForm} />
              )}
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
              <>
                <div>
                  <Subtitle>Группа</Subtitle>
                  <CustomSelect
                    key={`group-select-${selectedGroup.id}`}
                    items={groupsData?.activeSeason?.groups || []}
                    onChange={handleChangeGroup}
                    initValue={selectedGroup.name}
                  />
                </div>
                {studentsData?.usersByGroup?.length > 0 ? (
                  <div>
                    <Subtitle>Студент</Subtitle>
                    <CustomSelect
                      key={`student-select-${selectedStudent.id}`}
                      items={studentsData?.usersByGroup || []}
                      onChange={setSelectedStudent}
                      initValue={selectedStudent.name}
                    />
                  </div>
                ) : (
                  <Subtitle>Студентов нет</Subtitle>
                )}
              </>
            )}
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <SecondaryButton onClick={addStudentForm ? handleToggleEditForm : onClose}>
          {addStudentForm ? 'Отмена' : 'Выйти'}
        </SecondaryButton>
        {addStudentForm && <PrimaryButton onClick={handleAddStudent}>Добавить</PrimaryButton>}
      </ModalFooter>
    </Modal>
  );
}

export default memo(HouseModal);
