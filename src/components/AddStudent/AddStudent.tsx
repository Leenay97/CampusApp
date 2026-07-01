import { useState } from 'react';
import { InputField } from '@components/InputField/InputField';
import styles from './AddStudent.module.scss';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import { mutations } from '@graphql/mutations';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import Subtitle from '../Subtitle/Subtitle';

type AddTeacherProps = {
  groupId: string | undefined;
  onAdd?: () => void;
};

export function AddStudent({ onAdd, groupId }: AddTeacherProps) {
  const [studentName, setStudentName] = useState('');
  const [createStudent] = useGlobalLoadingMutation(mutations.CREATE_STUDENT);

  async function handleCreateTeacher() {
    if (!studentName) return;

    try {
      await createStudent({ russianName: studentName, groupId });
      setStudentName('');
      onAdd?.();
    } catch (err) {
      return;
    }
  }

  function handleChange(value: string) {
    setStudentName(value);
  }

  return (
    <div className={styles['add-teacher']}>
      <Subtitle>Добавить студента</Subtitle>
      <div className={styles['add-teacher__input']}>
        <InputField value={studentName} onChange={handleChange} placeholder="Вася Пупкин" />
        <PrimaryButton onClick={handleCreateTeacher}>Добавить</PrimaryButton>
      </div>
    </div>
  );
}
