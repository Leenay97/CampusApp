'use client';
import { memo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './style.module.scss';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@components/SecondaryButton/SecondaryButton';
import { InputField } from '../InputField/InputField';
import { TeacherCustomSelect } from '@components/TeacherCustomSelect/TeacherCustomSelect';
import { useMutation, useQuery } from '@apollo/client';
import queries from '@/graphql/queries';
import mutations from '@/graphql/mutations';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

function CreateWorkshopModal({ isOpen, onClose, onSubmit }: ModalProps) {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher>({ id: '', name: '' });
  const [name, setName] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [capacity, setCapacity] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const {
    loading: teachersLoading,
    data,
    refetch: refetchTeachers,
  } = useQuery(queries.GET_TEACHERS);

  const [createWorkshop] = useMutation(mutations.CREATE_WORKSHOP);

  const teachers = data?.teachers ?? [];

  if (!isOpen || !mounted) return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  function handleChangeTeacher(teacher: Teacher) {
    setSelectedTeacher(teacher);
  }

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  function handleClose() {
    onClose();
    setSelectedTeacher({ id: '', name: '' });
    setName('');
    setLocation('');
    setCapacity('');
  }

  function handleSubmit() {
    console.log('Selected teacher:', selectedTeacher, name, location, capacity);
    try {
      createWorkshop({
        variables: {
          name,
          place: location,
          teacherId: selectedTeacher.id,
          maxStudents: parseInt(capacity, 10),
        },
      });
      onSubmit();
      handleClose();
    } catch (error) {
      console.error('Error creating workshop:', error);
    }
  }

  return createPortal(
    <div className={styles['modal']}>
      <div className={styles['modal__content']} onClick={handleContentClick}>
        <div className={styles['modal__header']}>
          <h2 className="title" style={{ margin: '0' }}>
            Добавить мастеркласс
          </h2>
          <div className={styles['close-button']} onClick={onClose}>
            &times;
          </div>
        </div>
        <div className={styles['modal__body']}>
          <div className="subtitle">Название</div>
          <InputField value={name} onChange={setName} />
          <div className="subtitle">Учитель</div>
          <TeacherCustomSelect
            teachers={teachers}
            value={selectedTeacher}
            onChange={handleChangeTeacher}
          />
          <div className="subtitle">Место</div>
          <InputField value={location} onChange={setLocation} />
          <div className="subtitle">Количество человек</div>
          <InputField value={capacity} onChange={setCapacity} />
        </div>
        <div className={styles['modal__footer']}>
          <SecondaryButton onClick={handleClose}>Отмена</SecondaryButton>
          <PrimaryButton onClick={handleSubmit}>Добавить</PrimaryButton>
        </div>
      </div>
    </div>,
    modalRoot,
  );
}

export default memo(CreateWorkshopModal);
