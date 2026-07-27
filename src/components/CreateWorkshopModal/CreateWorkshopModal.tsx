'use client';
import { memo, useRef, useState, ChangeEvent } from 'react';
import Image from 'next/image';
import styles from './CreateWorkshopModal.module.scss';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@components/SecondaryButton/SecondaryButton';
import { InputField } from '../InputField/InputField';
import { useMutation, useQuery } from '@apollo/client';
import queries from '@/graphql/queries';
import mutations from '@/graphql/mutations';
import { DELETE_WORKSHOP_IMAGE } from '@/graphql/mutations/DeleteWorkshopImage';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { Place, User, UserLevel, Workshop as WorkshopType } from '@/app/types';
import { CustomSelect } from '@components/CustomSelect/CustomSelect';
import Subtitle from '../Subtitle/Subtitle';
import Loader from '../Loader/Loaader';
import Modal from '../Modal/Modal';
import ModalFooter from '../Modal/ModalFooter';
import ModalHeader from '../Modal/ModalHeader';
import ModalBody from '../Modal/ModalBody';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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
  const [description, setDescription] = useState<string>(workshop?.description ?? '');
  const [image, setImage] = useState<string | undefined>(workshop?.image);
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { data: teachersData, loading: teachersLoading } = useQuery(
    queries.GET_TEACHERS_WITH_ADMINS,
  );

  const {
    data: placesData,
    loading: placesLoading,
    refetch: refetchPlaces,
  } = useQuery(queries.GET_PLACES);

  const [createWorkshop] = useGlobalLoadingMutation(mutations.CREATE_WORKSHOP);
  const [updateWorkshop] = useGlobalLoadingMutation(mutations.UPDATE_WORKSHOP);
  const [createPlace] = useGlobalLoadingMutation(mutations.CREATE_PLACE);
  const [uploadWorkshopImage, { loading: imageUploading }] = useGlobalLoadingMutation<{
    uploadWorkshopImage: string;
  }>(mutations.UPLOAD_WORKSHOP_IMAGE);
  // Без глобального лоадера: чистка файлов должна проходить незаметно
  const [deleteWorkshopImage] = useMutation(DELETE_WORKSHOP_IMAGE);

  // Картинки, загруженные за эту сессию редактирования, но не обязательно сохранённые
  const uploadedImagesRef = useRef<string[]>([]);

  const loading = teachersLoading || placesLoading;

  const teachers = teachersData?.teachers ?? [];

  // Пометка только для списка: у админов и учителей встречаются одинаковые имена.
  // В сохранение уходит id, так что суффикс никуда дальше не попадает.
  const teacherOptions = teachers.map((teacher: User) =>
    teacher.userLevel === UserLevel.Admin
      ? { ...teacher, name: `${teacher.name} (ADMIN)` }
      : teacher,
  );

  const selectedTeacherLabel =
    teacherOptions.find((teacher: User) => teacher.id === selectedTeacher?.id)?.name ??
    selectedTeacher?.name;

  const places = placesData?.places ?? [];

  function handleChangeTeacher(teacher: User) {
    setSelectedTeacher(teacher);
  }

  function handleChangePlace(place: Place) {
    setSelectedPlace(place);
  }

  // Удаляет с сервера картинки, загруженные в этой сессии, но не оставленные в поле image
  function cleanupUnusedImages(finalImage?: string) {
    uploadedImagesRef.current
      .filter((url) => url !== finalImage)
      .forEach((url) => {
        deleteWorkshopImage({ variables: { url } }).catch((error) =>
          console.error('Ошибка удаления картинки:', error),
        );
      });
    uploadedImagesRef.current = [];
  }

  function handleClose() {
    // Мастеркласс не сохранён — все загруженные в этой сессии картинки не нужны
    cleanupUnusedImages();
    onClose();
    setSelectedTeacher({} as User);
    setSelectedPlace({} as Place);
    setName('');
    setCapacity('');
    setMaxAge('');
    setDescription('');
    setImage(undefined);
    setIsAddingPlace(false);
    setNewPlaceName('');
  }

  async function handleImageSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Файл не должен превышать 5MB');
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      alert('Поддерживаются только JPEG, PNG и WEBP');
      return;
    }

    try {
      const data = await uploadWorkshopImage({ file });
      uploadedImagesRef.current.push(data.uploadWorkshopImage);
      setImage(data.uploadWorkshopImage);
    } catch (error) {
      console.error('Error uploading workshop image:', error);
    }
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
          description,
          // явный null, а не undefined — иначе Apollo не передаст поле на сервер,
          // и сервер расценит это как "не менять", а не как "убрать картинку"
          image: image ?? null,
          placeId: selectedPlace.id,
          teacherId: selectedTeacher.id,
          ...(sportTime ? {} : { maxStudents: parseInt(capacity, 10) }),
          maxAge: parseInt(maxAge),
          date: selectedDate,
        });
      } else {
        await createWorkshop({
          name,
          description,
          image: image ?? null,
          placeId: selectedPlace.id,
          teacherId: selectedTeacher.id,
          ...(sportTime ? {} : { maxStudents: parseInt(capacity, 10) }),
          maxAge: parseInt(maxAge),
          type: sportTime ? 'SPORT' : 'WORKSHOP',
          date: selectedDate,
        });
      }
      cleanupUnusedImages(image);
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
      <ModalBody className={styles['modal__body']}>
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
              <Subtitle>Название*</Subtitle>
              <InputField value={name} onChange={setName} />
            </div>
            <div>
              <Subtitle>Учитель*</Subtitle>
              <CustomSelect
                items={teacherOptions}
                initValue={selectedTeacherLabel}
                onChange={handleChangeTeacher}
              />
            </div>
            <div>
              <Subtitle>Место*</Subtitle>
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
            {!sportTime && (
              <div>
                <Subtitle>Количество человек*</Subtitle>
                <InputField value={capacity} onChange={setCapacity} />
              </div>
            )}
            <div>
              <Subtitle>Минимальный возраст</Subtitle>
              <div className={styles['modal__age']}>
                <InputField maxLength={2} width="40px" value={maxAge} onChange={setMaxAge} />+
              </div>
            </div>
            {!sportTime && (
              <>
                <div>
                  <Subtitle>Описание</Subtitle>
                  <textarea
                    className={styles['modal__textarea']}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="О чём этот мастеркласс?"
                    rows={4}
                  />
                </div>
                <div>
                  <Subtitle>Картинка</Subtitle>
                  {image ? (
                    <div className={styles['modal__image-preview']}>
                      <div className={styles['modal__image-preview-frame']}>
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}${image}`}
                          alt="Превью мастеркласса"
                          fill
                          unoptimized
                          className={styles['modal__image-preview-img']}
                        />
                      </div>
                      <SecondaryButton onClick={() => setImage(undefined)}>Удалить</SecondaryButton>
                    </div>
                  ) : (
                    <SecondaryButton
                      onClick={() => imageInputRef.current?.click()}
                      disabled={imageUploading}
                    >
                      {imageUploading ? 'Загрузка...' : '+ Добавить картинку'}
                    </SecondaryButton>
                  )}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageSelect}
                    hidden
                  />
                </div>
              </>
            )}
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
