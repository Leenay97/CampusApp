'use client';
import { memo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './style.module.scss';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@components/SecondaryButton/SecondaryButton';
import { InputField } from '../InputField/InputField';
import { useMutation, useQuery } from '@apollo/client';
import queries from '@/graphql/queries';
import mutations from '@/graphql/mutations';
import { LoadingType, Place, Teacher, User } from '@/app/types';
import { CustomSelect } from '@components/CustomSelect/CustomSelect';
import Title from '../Title/Title';
import Subtitle from '../Subtitle/Subtitle';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

function CreateWorkshopModal({ isOpen, onClose, onSubmit }: ModalProps) {
  const [selectedTeacher, setSelectedTeacher] = useState<User>({} as User);
  const [selectedPlace, setSelectedPlace] = useState<Place>({} as Place);
  const [name, setName] = useState<string>('');
  const [maxAge, setMaxAge] = useState<string>('');
  const [capacity, setCapacity] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    /*eslint-disable react-hooks/set-state-in-effect*/
    setMounted(true);
  }, []);

  const { loading: teachersLoading, data: teachersData } = useQuery(queries.GET_TEACHERS);

  const { loading: placesLoading, data: placesData } = useQuery(queries.GET_PLACES);

  const [createWorkshop] = useMutation(mutations.CREATE_WORKSHOP);

  const teachers = teachersData?.teachers ?? [];

  const places = placesData?.places ?? [];

  if (!isOpen || !mounted) return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  function handleChangeTeacher(teacher: User) {
    setSelectedTeacher(teacher);
  }

  function handleChangePlace(place: Place) {
    setSelectedPlace(place);
  }

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  function handleClose() {
    onClose();
    setSelectedTeacher({} as User);
    setSelectedPlace({} as Place);
    setName('');
    setCapacity('');
    setMaxAge('');
  }

  function handleSubmit() {
    try {
      createWorkshop({
        variables: {
          name,
          placeId: selectedPlace.id,
          teacherId: selectedTeacher.id,
          maxStudents: parseInt(capacity, 10),
          maxAge: parseInt(maxAge),
          type: 'WORKSHOP',
        },
      });
      onSubmit();
    } catch (error) {
      console.error('Error creating workshop:', error);
    }
  }

  return createPortal(
    <div className={styles['modal']}>
      <div className={styles['modal__content']} onClick={handleContentClick}>
        <div className={styles['modal__header']}>
          <Title>Добавить мастеркласс</Title>
          <div className={styles['close-button']} onClick={onClose}>
            &times;
          </div>
        </div>
        <div className={styles['modal__body']}>
          <div>
            <Subtitle>Название</Subtitle>
            <InputField value={name} onChange={setName} />
          </div>
          <div>
            <Subtitle>Учитель</Subtitle>
            <CustomSelect
              items={teachers}
              isLoading={teachersLoading}
              onChange={handleChangeTeacher}
            />
          </div>
          <div>
            <Subtitle>Место</Subtitle>
            <CustomSelect items={places} isLoading={placesLoading} onChange={handleChangePlace} />
          </div>
          <div>
            <Subtitle>Количество человек</Subtitle>
            <InputField value={capacity} onChange={setCapacity} />
          </div>
          <div>
            <Subtitle>Максимальный возраст</Subtitle>
            <div className={styles['modal__age']}>
              <InputField maxLength={2} width="40px" value={maxAge} onChange={setMaxAge} />+
            </div>
          </div>
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
