import { useState } from 'react';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import { Group, User } from '@/app/types';
import Modal from '../Modal/Modal';
import ModalHeader from '../Modal/ModalHeader';
import ModalBody from '../Modal/ModalBody';
import ModalFooter from '../Modal/ModalFooter';
import SecondaryButton from '../SecondaryButton/SecondaryButton';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { CREATE_GROUP } from '@/graphql/mutations/CreateGroup';
import { UPDATE_GROUP } from '@/graphql/mutations/UpdateGroup';
import { useQuery } from '@apollo/client';
import { GET_TEACHERS } from '@/graphql/queries/GetTeachers';
import { InputField } from '../InputField/InputField';
import Subtitle from '../Subtitle/Subtitle';
import Loader from '../Loader/Loaader';
import { List } from '../List/List';
import { CustomSelect } from '../CustomSelect/CustomSelect';

type CreateGroupModalProps = {
  seasonId: string;
  group?: Group;
  onClose: () => void;
  onRefetchSeason: () => void;
};

export function CreateGroupModal({
  seasonId,
  group,
  onClose,
  onRefetchSeason,
}: CreateGroupModalProps) {
  const [groupTeachers, setGroupTeachers] = useState<User[]>(group?.teachers ?? []);
  const [teacherToAdd, setTeacherToAdd] = useState<User>();
  const [groupName, setGroupName] = useState<string>(group?.name ?? '');
  const [createGroup] = useGlobalLoadingMutation(CREATE_GROUP);
  const [editGroup] = useGlobalLoadingMutation(UPDATE_GROUP);
  const {
    data: teachersData,
    loading: teachersLoading,
    refetch: refetchTeachers,
  } = useQuery(GET_TEACHERS);

  console.log(group);

  async function handleCreateGroup() {
    if (!groupTeachers.length) return;

    try {
      const teacherIds = groupTeachers.map((teacher) => teacher.id);

      if (group) {
        await editGroup({ id: group.id, name: groupName, teacherIds });
      } else {
        await createGroup({ name: groupName, teacherIds, seasonId });
      }
      refetchTeachers();
      onRefetchSeason();
      onClose();
    } catch (err) {
      console.error('Ошибка при сохранении группы:', err);
    }
  }

  function handleChangeTeacher(value: User) {
    setTeacherToAdd(value);
  }

  function handleAddTeacher() {
    if (!teacherToAdd) return;
    setGroupTeachers((prev) => [...prev, teacherToAdd]);
  }

  function handleRemoveTeacher(item: User | null) {
    if (!item) return;
    setGroupTeachers((prev) => prev.filter((teacher) => item.id !== teacher.id));
  }

  console.log(teacherToAdd);

  return (
    <Modal onClose={onClose}>
      <ModalHeader title={group ? 'Редактировать группу' : 'Создать группу'} onClose={onClose} />
      <ModalBody>
        {teachersLoading && <Loader />}
        {!teachersLoading && (
          <>
            <InputField value={groupName} onChange={setGroupName} placeholder="Название группы" />
            {Boolean(groupTeachers.length) && (
              <List title="Учителя" items={groupTeachers} onDelete={handleRemoveTeacher} />
            )}
            {teachersData?.teachers.length ? (
              <>
                <CustomSelect items={teachersData?.teachers} onChange={handleChangeTeacher} />
                <PrimaryButton onClick={handleAddTeacher}>Добавить</PrimaryButton>
              </>
            ) : (
              <Subtitle>У всех учителей есть группа</Subtitle>
            )}
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <SecondaryButton onClick={onClose}>Отмена</SecondaryButton>
        <PrimaryButton onClick={handleCreateGroup}>{group ? 'Принять' : 'Создать'}</PrimaryButton>
      </ModalFooter>
    </Modal>
  );
}
