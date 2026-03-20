import { User } from '@/app/types';
import styles from './EditStudentModal.module.scss';
import { memo, useEffect, useState } from 'react';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { UPDATE_USER } from '@/graphql/mutations/UpdateUser';
import { createPortal } from 'react-dom';
import Title from '../Title/Title';
import { InputField } from '../InputField/InputField';
import SecondaryButton from '../SecondaryButton/SecondaryButton';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import Subtitle from '../Subtitle/Subtitle';
import { CustomSelect } from '../CustomSelect/CustomSelect';
import { useQuery } from '@apollo/client';
import { GET_ACTIVE_SEASON } from '@/graphql/queries/GetActiveSeason';

type ModalProps = {
  student: User;
  onSubmit: () => void;
  onClose: () => void;
};

function EditStudentModal({ student, onSubmit, onClose }: ModalProps) {
  const [name, setName] = useState<string>('');
  const [group, setGroup] = useState({ id: '', name: '' });
  const [updateUser] = useGlobalLoadingMutation(UPDATE_USER);
  const { data } = useQuery(GET_ACTIVE_SEASON);

  console.log(student);

  useEffect(() => {
    /*eslint-disable react-hooks/set-state-in-effect*/
    setName(student?.name);
    setGroup({ id: student?.group?.id ?? '', name: student?.group?.name ?? '' });
  }, [student]);

  if (typeof window === 'undefined') return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  function handleChangeName(value: string) {
    setName(value);
  }

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  function handleChangeGroup({ id, name }: { id: string; name: string }) {
    setGroup({ id, name });
  }

  async function handleUpdate() {
    try {
      await updateUser({ id: student.id, name: name || null, groupId: group.id || null });
      onClose();
      onSubmit();
    } catch (err) {
      console.log(err);
    }
  }

  return createPortal(
    <div className={styles['student-modal']} onClick={handleOverlayClick}>
      <div className={styles['student-modal__content']} onClick={handleContentClick}>
        <div className={styles['student-modal__header']}>
          <Title noMargin>Изменить студента: {student?.name}</Title>
        </div>
        <div className={styles['student-modal__body']}>
          <div>
            <Subtitle>Имя</Subtitle>
            <InputField value={name} onChange={handleChangeName} />
          </div>
          <div>
            <Subtitle>Группа</Subtitle>
            <CustomSelect
              items={data?.activeSeason?.groups}
              onChange={handleChangeGroup}
              initValue={student.group ? student?.group.name : ''}
            />
          </div>
        </div>
        <div className={styles['student-modal__footer']}>
          <SecondaryButton onClick={onClose}>Отмена</SecondaryButton>
          <PrimaryButton onClick={handleUpdate}>Принять</PrimaryButton>
        </div>
      </div>
    </div>,
    modalRoot,
  );
}

export default memo(EditStudentModal);
