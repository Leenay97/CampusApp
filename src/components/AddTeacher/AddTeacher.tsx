import { useState } from 'react';
import { InputField } from '@components/InputField/InputField';
import styles from './AddTeacher.module.scss';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import { mutations } from '@graphql/mutations';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import Subtitle from '../Subtitle/Subtitle';

type AddTeacherProps = {
  onAdd?: () => void;
};

export function AddTeacher({ onAdd }: AddTeacherProps) {
  const [teacherName, setTeacherName] = useState('');
  const [createTeacher] = useGlobalLoadingMutation(mutations.CREATE_TEACHER);

  async function handleCreateTeacher() {
    if (!teacherName) return;

    try {
      await createTeacher({ name: teacherName });
      setTeacherName('');
      onAdd?.();
    } catch (err) {
      return;
    }
  }

  function handleChange(value: string) {
    setTeacherName(value);
  }

  return (
    <div className={styles['add-teacher']}>
      <Subtitle>Добавить учителя</Subtitle>
      <div className={styles['add-teacher__input']}>
        <InputField value={teacherName} onChange={handleChange} />
        <PrimaryButton onClick={handleCreateTeacher}>Добавить</PrimaryButton>
      </div>
    </div>
  );
}
