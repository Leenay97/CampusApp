'use client';
import { memo, useState, ChangeEvent } from 'react';
import styles from './CreateWorkshopModal.module.scss';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@components/SecondaryButton/SecondaryButton';
import { InputField } from '../InputField/InputField';
import { useQuery } from '@apollo/client';
import queries from '@/graphql/queries';
import mutations from '@/graphql/mutations';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { Place, User, Workshop as WorkshopType } from '@/app/types';
import { CustomSelect } from '@components/CustomSelect/CustomSelect';
import Subtitle from '../Subtitle/Subtitle';
import Loader from '../Loader/Loaader';
import Modal from '../Modal/Modal';
import ModalFooter from '../Modal/ModalFooter';
import ModalHeader from '../Modal/ModalHeader';
import ModalBody from '../Modal/ModalBody';

type WorkshopDate = {
  label: string;
  value: string;
  timestamp: number;
};

type ModalProps = {
  sportTime?: boolean;
  allDates: WorkshopDate[];
  selectedDate: string;
  onDateChange: (e: ChangeEvent<HTMLSelectElement, Element>) => void;
  onClose: () => void;
  onSubmit: () => void;
  editMode?: boolean;
  workshop?: WorkshopType;
};

function CreateWorkshopModal({
  sportTime,
  allDates,
  selectedDate,
  onDateChange,
  onClose,
  onSubmit,
  editMode = false,
  workshop,
}: ModalProps) {
  const [selectedTeacher, setSelectedTeacher] = useState<User>(
    (workshop?.teacher as User) ?? ({} as User),
  );
  const [selectedPlace, setSelectedPlace] = useState<Place>(
    (workshop?.place as Place) ?? ({} as Place),
  );
  const [name, setName] = useState<string>(workshop?.name ?? '');
  const [maxAge, setMaxAge] = useState<string>(workshop?.maxAge ? String(workshop.maxAge) : '');
  const [capacity, setCapacity] = useState<string>(
    workshop?.maxStudents ? String(workshop.maxStudents) : '',
  );
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState('');

  const { data: teachersData, loading: teachersLoading } = useQuery(queries.GET_TEACHERS);

  const {
    data: placesData,
    loading: placesLoading,
    refetch: refetchPlaces,
  } = useQuery(queries.GET_PLACES);

  const [createWorkshop] = useGlobalLoadingMutation(mutations.CREATE_WORKSHOP);
  const [updateWorkshop] = useGlobalLoadingMutation(mutations.UPDATE_WORKSHOP);
  const [createPlace] = useGlobalLoadingMutation(mutations.CREATE_PLACE);

  const loading = teachersLoading || placesLoading;

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
    setIsAddingPlace(false);
    setNewPlaceName('');
  }

  async function handleCreatePlace() {
    if (!newPlaceName.trim()) return;
    try {
      const data = (await createPlace({ name: newPlaceName, isTeamPlace: false })) as {
        createPlace: Place;
      };
      await refetchPlaces();
      if (data?.createPlace) {
        setSelectedPlace(data.createPlace);
      }
      setNewPlaceName('');
      setIsAddingPlace(false);
    } catch (error) {
      console.error('Error creating place:', error);
    }
  }

  async function handleSubmit() {
    try {
      if (editMode && workshop) {
        await updateWorkshop({
          id: workshop.id,
          name,
          placeId: selectedPlace.id,
          teacherId: selectedTeacher.id,
          maxStudents: parseInt(capacity, 10),
          maxAge: parseInt(maxAge),
          date: selectedDate,
        });
      } else {
        await createWorkshop({
          name,
          placeId: selectedPlace.id,
          teacherId: selectedTeacher.id,
          maxStudents: parseInt(capacity, 10),
          maxAge: parseInt(maxAge),
          type: sportTime ? 'SPORT' : 'WORKSHOP',
          date: selectedDate,
        });
      }
      onSubmit();
    } catch (error) {
      console.error(editMode ? 'Error updating workshop:' : 'Error creating workshop:', error);
    }
  }

  return (
    <Modal onClose={onClose} className={styles['modal__content']}>
      <ModalHeader
        title={`${editMode ? 'Редактировать' : 'Добавить'} ${sportTime ? 'Sport Time' : 'мастеркласс'}`}
        onClose={onClose}
      />
      <ModalBody>
        {loading && <Loader />}
        {!loading && (
          <>
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
              <CustomSelect
                items={teachers}
                initValue={selectedTeacher?.name}
                onChange={handleChangeTeacher}
              />
            </div>
            <div>
              <Subtitle>Место</Subtitle>
              <CustomSelect
                items={places}
                initValue={selectedPlace?.name}
                onChange={handleChangePlace}
              />
              {isAddingPlace ? (
                <div className={styles['modal__add-place']}>
                  <InputField
                    value={newPlaceName}
                    onChange={setNewPlaceName}
                    placeholder="Название места"
                  />
                  <PrimaryButton onClick={handleCreatePlace}>Добавить</PrimaryButton>
                  <SecondaryButton
                    onClick={() => {
                      setIsAddingPlace(false);
                      setNewPlaceName('');
                    }}
                  >
                    Отмена
                  </SecondaryButton>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles['modal__add-place-toggle']}
                  onClick={() => setIsAddingPlace(true)}
                >
                  + Добавить новое место
                </button>
              )}
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
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <SecondaryButton onClick={handleClose}>Отмена</SecondaryButton>
        <PrimaryButton onClick={handleSubmit}>{editMode ? 'Сохранить' : 'Добавить'}</PrimaryButton>
      </ModalFooter>
    </Modal>
  );
}

export default memo(CreateWorkshopModal);
