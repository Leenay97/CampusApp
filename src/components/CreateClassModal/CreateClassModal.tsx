'use client';
import { memo, useState } from 'react';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@components/SecondaryButton/SecondaryButton';
import { InputField } from '../InputField/InputField';
import { useQuery } from '@apollo/client';
import queries from '@/graphql/queries';
import { Place, User } from '@/app/types';
import { CustomSelect } from '@components/CustomSelect/CustomSelect';
import Subtitle from '../Subtitle/Subtitle';
import { MultipleSelect } from '../MultipleSelect/MultipleSelect';
import { CREATE_CLASS } from '@/graphql/mutations/CreateClass';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import Loader from '../Loader/Loaader';
import Modal from '../Modal/Modal';
import ModalHeader from '../Modal/ModalHeader';
import ModalBody from '../Modal/ModalBody';
import ModalFooter from '../Modal/ModalFooter';

type ModalProps = {
  sportTime?: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

const MAX_TEACHERS = 3;

function CreateClassModal({ onClose, onSubmit }: ModalProps) {
  const [selectedTeachers, setSelectedTeachers] = useState<User[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<User[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place>({} as Place);
  const [name, setName] = useState<string>('');

  const { data: teachersData, loading: teachersLoading } = useQuery(queries.GET_TEACHERS);

  const { data: studentsData, loading: studentsLoading } = useQuery(queries.GET_SEASON_STUDENTS);

  const { data: placesData, loading: placesLoading } = useQuery(queries.GET_PLACES);

  const [createClass] = useGlobalLoadingMutation(CREATE_CLASS);

  const loading = teachersLoading || studentsLoading || placesLoading;

  const teachers = teachersData?.teachers ?? [];

  const students = studentsData?.seasonStudents ?? [];

  const places = placesData?.places ?? [];

  function handleChangeTeacher(teachers: User[]) {
    setSelectedTeachers(teachers.slice(0, MAX_TEACHERS));
  }

  function handleChangePlace(place: Place) {
    setSelectedPlace(place);
  }

  function handleClose() {
    onClose();
    setSelectedTeachers([]);
    setSelectedStudents([]);
    setSelectedPlace({} as Place);
    setName('');
  }

  async function handleSubmit() {
    try {
      await createClass({
        name,
        placeId: selectedPlace.id,
        teacherIds: selectedTeachers.map((teacher) => teacher.id),
        studentIds: selectedStudents.map((student) => student.id),
      });
      onSubmit();
    } catch (error) {
      console.error('Error creating class:', error);
    }
  }

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Создать класс" onClose={onClose} />
      <ModalBody>
        {loading && <Loader />}
        {!loading && (
          <>
            <div>
              <Subtitle>Название</Subtitle>
              <InputField value={name} onChange={setName} />
            </div>
            <div>
              <Subtitle>Учителя (1–3)</Subtitle>
              <MultipleSelect
                value={selectedTeachers}
                items={teachers}
                onChange={handleChangeTeacher}
              />
            </div>
            <div>
              <Subtitle>Студенты</Subtitle>
              <MultipleSelect
                value={selectedStudents}
                items={students}
                onChange={setSelectedStudents}
              />
            </div>
            <div>
              <Subtitle>Место</Subtitle>
              <CustomSelect items={places} onChange={handleChangePlace} />
            </div>
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <SecondaryButton onClick={handleClose}>Отмена</SecondaryButton>
        <PrimaryButton onClick={handleSubmit}>Добавить</PrimaryButton>
      </ModalFooter>
    </Modal>
  );
}

export default memo(CreateClassModal);
