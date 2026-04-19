import { useState } from 'react';
import styles from './style.module.scss';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import { MultipleSelect } from '@components/MultipleSelect/MultipleSelect';
import { GroupInput, User } from '@/app/types';
import Subtitle from '../Subtitle/Subtitle';

type AddGroupProps = {
  onAdd: (group: GroupInput) => void;
  teachers: User[];
};

export function AddGroup({ onAdd, teachers }: AddGroupProps) {
  const [groupTeachers, setGroupTeachers] = useState<User[]>([]);

  async function handleCreateGroup() {
    if (!groupTeachers.length) return;

    try {
      const groupName = groupTeachers.map((teacher) => teacher.name).join('-');
      const teacherIds = groupTeachers.map((teacher) => teacher.id);
      const newGroup: GroupInput = { name: groupName, teacherIds: teacherIds };
      setGroupTeachers([]);
      onAdd(newGroup);
    } catch (err) {
      console.error('Ошибка при создании группы:', err);
    }
  }

  function handleChangeTeacher(value: User[]) {
    setGroupTeachers(value);
  }

  return (
    <div className={styles['add-group']}>
      <Subtitle>Добавить группу</Subtitle>
      <div className={styles['add-group__input']}>
        <MultipleSelect<User>
          value={groupTeachers}
          items={teachers}
          onChange={handleChangeTeacher}
        />
        <PrimaryButton onClick={handleCreateGroup}>Добавить</PrimaryButton>
      </div>
    </div>
  );
}
