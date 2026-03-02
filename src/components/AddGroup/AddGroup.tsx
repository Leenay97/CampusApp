import { useState } from 'react';
import styles from './style.module.scss';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import { MultipleSelect } from '@components/MultipleSelect/MultipleSelect';

type AddGroupProps = {
  onAdd: (group: GroupInput) => void;
  teachers: Teacher[];
};

export function AddGroup({ onAdd, teachers }: AddGroupProps) {
  const [groupTeachers, setGroupTeachers] = useState<Teacher[]>([]);

  async function handleCreateGroup() {
    if (!groupTeachers.length) return;

    try {
      const groupName = groupTeachers.map((teacher) => teacher.name).join('-');
      const teacherIds = groupTeachers.map((teacher) => teacher.id);
      console.log(teacherIds);
      const newGroup: GroupInput = { name: groupName, teacherIds: teacherIds };
      setGroupTeachers([]);
      onAdd(newGroup);
    } catch (err) {
      console.error('Ошибка при создании группы:', err);
    }
  }

  function handleChangeTeacher(value: Teacher[]) {
    setGroupTeachers(value);
  }

  return (
    <div className={styles['add-group']}>
      <h1 className="subtitle">Добавить группу</h1>
      <div className={styles['add-group__input']}>
        <MultipleSelect value={groupTeachers} teachers={teachers} onChange={handleChangeTeacher} />
        <PrimaryButton onClick={handleCreateGroup}>Добавить</PrimaryButton>
      </div>
    </div>
  );
}
