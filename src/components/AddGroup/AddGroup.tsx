import { useState } from 'react';
import styles from './style.module.scss';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import { useMutation } from '@apollo/client';
import { CREATE_GROUP } from '@graphql/mutations/CreateGroup';
import { MultipleSelect } from '@components/MultipleSelect/MultipleSelect';

type AddGroupProps = {
  onAdd: () => void;
  teachers: Teacher[];
};

export function AddGroup({ onAdd, teachers }: AddGroupProps) {
  const [groupTeachers, setGroupTeachers] = useState<Teacher[]>([]);
  const [CreateGroup] = useMutation(CREATE_GROUP);

  async function handleCreateGroup() {
    if (!groupTeachers.length) return;

    try {
      const groupName = groupTeachers.map((teacher) => teacher.name).join('-');
      const teacherIds = groupTeachers.map((teacher) => teacher.id);
      console.log(teacherIds);
      const result = await CreateGroup({
        variables: { name: groupName, teacherIds: teacherIds },
      });
      console.log('Группа создана:', result.data.createTeacher);
      setGroupTeachers([]);
      onAdd();
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
