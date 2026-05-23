'use client';
import { memo, useState, ChangeEvent } from 'react';
import styles from './CreateWorkshopModal.module.scss';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@components/SecondaryButton/SecondaryButton';
import { InputField } from '../InputField/InputField';
import { useMutation, useQuery } from '@apollo/client';
import queries from '@/graphql/queries';
import mutations from '@/graphql/mutations';
import { Place, User } from '@/app/types';
import { CustomSelect } from '@components/CustomSelect/CustomSelect';
import Subtitle from '../Subtitle/Subtitle';
import Modal from '../Modal/Modal';
import ModalFooter from '../Modal/ModalFooter';
import ModalHeader from '../Modal/ModalHeader';
import ModalBody from '../Modal/ModalBody';

type ModalProps = {
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

function CreateWorkshopModal({
  sportTime,
  allDates,
  selectedDate,
  onDateChange,
  onClose,
  onSubmit,
}: ModalProps) {
  const [selectedTeacher, setSelectedTeacher] = useState<User>({} as User);
  const [selectedPlace, setSelectedPlace] = useState<Place>({} as Place);
  const [name, setName] = useState<string>('');
  const [maxAge, setMaxAge] = useState<string>('');
  const [capacity, setCapacity] = useState<string>('');

  const { data: teachersData } = useQuery(queries.GET_TEACHERS);

  const { data: placesData } = useQuery(queries.GET_PLACES);

  const [createWorkshop] = useMutation(mutations.CREATE_WORKSHOP);

  const teachers = teachersData?.teachers ?? [];

  const places = placesData?.places ?? [];

  function handleChangeTeacher(teacher: User) {
    setSelectedTeacher(teacher);
  }

  function handleChangePlace(place: Place) {
    setSelectedPlace(place);
  }

  function handleClose() {
    onClose();
    setSelectedTeacher({} as User);
    setSelectedPlace({} as Place);
    setName('');
    setCapacity('');
    setMaxAge('');
  }

  async function handleSubmit() {
    try {
      await createWorkshop({
        variables: {
          name,
          placeId: selectedPlace.id,
          teacherId: selectedTeacher.id,
          maxStudents: parseInt(capacity, 10),
          maxAge: parseInt(maxAge),
          type: sportTime ? 'SPORT' : 'WORKSHOP',
          date: selectedDate,
        },
      });
      onSubmit();
    } catch (error) {
      console.error('Error creating workshop:', error);
    }
  }

  return (
    <Modal onClose={onClose} className={styles['modal__content']}>
      <ModalHeader
        title={`Добавить ${sportTime ? 'Sport Time' : 'мастеркласс'}`}
        onClose={onClose}
      />
      <ModalBody>
        {allDates.length > 0 && (
          <div>
            <Subtitle>Дата</Subtitle>
            <select
              value={selectedDate}
              onChange={onDateChange}
              style={{
                width: '100%',
                padding: '6px',
                fontSize: '14px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              {allDates.map((date) => (
                <option key={date.value} value={date.value}>
                  {date.label}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <Subtitle>Название</Subtitle>
          <InputField value={name} onChange={setName} />
        </div>
        <div>
          <Subtitle>Учитель</Subtitle>
          <CustomSelect items={teachers} onChange={handleChangeTeacher} />
        </div>
        <div>
          <Subtitle>Место</Subtitle>
          <CustomSelect items={places} onChange={handleChangePlace} />
        </div>
        <div>
          <Subtitle>Количество человек</Subtitle>
          <InputField value={capacity} onChange={setCapacity} />
        </div>
        <div>
          <Subtitle>Минимальный возраст</Subtitle>
          <div className={styles['modal__age']}>
            <InputField maxLength={2} width="40px" value={maxAge} onChange={setMaxAge} />+
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <SecondaryButton onClick={handleClose}>Отмена</SecondaryButton>
        <PrimaryButton onClick={handleSubmit}>Добавить</PrimaryButton>
      </ModalFooter>
    </Modal>
  );
}

export default memo(CreateWorkshopModal);
