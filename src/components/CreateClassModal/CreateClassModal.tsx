'use client';
import { memo, useState, useEffect, ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import styles from './CreateClassModal.module.scss';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@components/SecondaryButton/SecondaryButton';
import { InputField } from '../InputField/InputField';
import { useQuery } from '@apollo/client';
import queries from '@/graphql/queries';
import { Place, User } from '@/app/types';
import { CustomSelect } from '@components/CustomSelect/CustomSelect';
import Title from '../Title/Title';
import Subtitle from '../Subtitle/Subtitle';
import { MultipleSelect } from '../MultipleSelect/MultipleSelect';
import { CREATE_CLASS } from '@/graphql/mutations/CreateClass';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';

type ModalProps = {
  isOpen: boolean;
  sportTime?: boolean;
  allDates: {
    label: string;
    value: string;
    timestamp: number;
  }[];
  selectedDate: string;
  onDateChange: (e: ChangeEvent<HTMLSelectElement, Element>) => void;
  onClose: () => void;
  onSubmit: () => void;
};

function CreateClassModal({
  isOpen,
  sportTime,
  allDates,
  selectedDate,
  onDateChange,
  onClose,
  onSubmit,
}: ModalProps) {
  const [selectedTeachers, setSelectedTeachers] = useState<User[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place>({} as Place);
  const [name, setName] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    /*eslint-disable react-hooks/set-state-in-effect*/
    setMounted(true);
  }, []);

  const { loading: teachersLoading, data: teachersData } = useQuery(queries.GET_TEACHERS);

  const { loading: placesLoading, data: placesData } = useQuery(queries.GET_PLACES);

  const [createClass] = useGlobalLoadingMutation(CREATE_CLASS);

  const teachers = teachersData?.teachers ?? [];

  const places = placesData?.places ?? [];

  if (!isOpen || !mounted) return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  function handleChangeTeacher(teachers: User[]) {
    setSelectedTeachers(teachers);
  }

  function handleChangePlace(place: Place) {
    setSelectedPlace(place);
  }

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  function handleClose() {
    onClose();
    setSelectedTeachers([]);
    setSelectedPlace({} as Place);
    setName('');
  }

  async function handleSubmit() {
    try {
      await createClass({
        name,
        placeId: selectedPlace.id,
        teacherIds: selectedTeachers.map((teacher) => teacher.id),
      });
      onSubmit();
    } catch (error) {
      console.error('Error creating class:', error);
    }
  }

  return createPortal(
    <div className={styles['modal']}>
      <div className={styles['modal__content']} onClick={handleContentClick}>
        <div className={styles['modal__header']}>
          <Title>Добавить {sportTime ? 'Sport Time' : 'мастеркласс'}</Title>
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
            <MultipleSelect
              value={selectedTeachers}
              items={teachers}
              onChange={handleChangeTeacher}
            />
          </div>
          <div>
            <Subtitle>Место</Subtitle>
            <CustomSelect items={places} isLoading={placesLoading} onChange={handleChangePlace} />
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

export default memo(CreateClassModal);
