'use client';
import { memo, useMemo, useState } from 'react';
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
import { UPDATE_CLASS } from '@/graphql/mutations/UpdateClass';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import Loader from '../Loader/Loaader';
import Modal from '../Modal/Modal';
import ModalHeader from '../Modal/ModalHeader';
import ModalBody from '../Modal/ModalBody';
import ModalFooter from '../Modal/ModalFooter';
import styles from './CreateClassModal.module.scss';

export type ClassToEdit = {
  id: string;
  name: string;
  teachers: User[];
  students: User[];
  place?: { id: string; name: string };
};

type ModalProps = {
  sportTime?: boolean;
  classToEdit?: ClassToEdit;
  onClose: () => void;
  onSubmit: () => void;
};

const MAX_TEACHERS = 5;

function CreateClassModal({ classToEdit, onClose, onSubmit }: ModalProps) {
  const [selectedTeachers, setSelectedTeachers] = useState<User[]>(classToEdit?.teachers ?? []);
  const [selectedStudents, setSelectedStudents] = useState<User[]>(classToEdit?.students ?? []);
  const [selectedPlace, setSelectedPlace] = useState<Place>(
    (classToEdit?.place as Place) ?? ({} as Place),
  );
  const [name, setName] = useState<string>(classToEdit?.name ?? '');
  const [studentGroupId, setStudentGroupId] = useState<string>('');
  const [studentPickerKey, setStudentPickerKey] = useState(0);

  const { data: teachersData, loading: teachersLoading } = useQuery(queries.GET_TEACHERS);

  const { data: studentsData, loading: studentsLoading } = useQuery(queries.GET_SEASON_STUDENTS);

  const { data: placesData, loading: placesLoading } = useQuery(queries.GET_PLACES);

  const [createClass] = useGlobalLoadingMutation(CREATE_CLASS);
  const [updateClass] = useGlobalLoadingMutation(UPDATE_CLASS);

  const loading = teachersLoading || studentsLoading || placesLoading;

  const teachers = teachersData?.teachers ?? [];

  const places = placesData?.places ?? [];

  const students: User[] = useMemo(() => studentsData?.seasonStudents ?? [], [studentsData]);

  const studentGroups = useMemo(() => {
    const groupsById = new Map<string, { id: string; name: string }>();
    students.forEach((student) => {
      if (student.group) groupsById.set(student.group.id, student.group);
    });
    return Array.from(groupsById.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [students]);

  const studentsInGroup = useMemo(() => {
    const selectedIds = new Set(selectedStudents.map((student) => student.id));
    return students
      .filter(
        (student) =>
          student.group?.id === studentGroupId && !selectedIds.has(student.id) && student.name,
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [students, studentGroupId, selectedStudents]);

  function handleChangeTeacher(teachers: User[]) {
    setSelectedTeachers(teachers.slice(0, MAX_TEACHERS));
  }

  function handleChangePlace(place: Place) {
    setSelectedPlace(place);
  }

  function handlePickStudentGroup(group: { id: string; name: string }) {
    setStudentGroupId(group.id);
    setStudentPickerKey((key) => key + 1);
  }

  function handlePickStudent(student: User) {
    if (!student?.id) return;
    setSelectedStudents((prev) => [...prev, student]);
    setStudentPickerKey((key) => key + 1);
  }

  function handleRemoveStudent(studentId: string) {
    setSelectedStudents((prev) => prev.filter((student) => student.id !== studentId));
  }

  function handleClose() {
    onClose();
    setSelectedTeachers([]);
    setSelectedStudents([]);
    setSelectedPlace({} as Place);
    setName('');
    setStudentGroupId('');
    setStudentPickerKey(0);
  }

  async function handleSubmit() {
    try {
      if (classToEdit) {
        await updateClass({
          id: classToEdit.id,
          name,
          placeId: selectedPlace.id,
          teacherIds: selectedTeachers.map((teacher) => teacher.id),
          studentIds: selectedStudents.map((student) => student.id),
        });
      } else {
        await createClass({
          name,
          placeId: selectedPlace.id,
          teacherIds: selectedTeachers.map((teacher) => teacher.id),
          studentIds: selectedStudents.map((student) => student.id),
        });
      }
      onSubmit();
    } catch (error) {
      console.error('Error saving class:', error);
    }
  }

  return (
    <Modal onClose={onClose}>
      <ModalHeader
        title={classToEdit ? 'Редактировать класс' : 'Создать класс'}
        onClose={onClose}
      />
      <ModalBody>
        {loading && <Loader />}
        {!loading && (
          <>
            <div>
              <Subtitle>Название</Subtitle>
              <InputField value={name} onChange={setName} />
            </div>
            <div>
              <Subtitle>Учителя (1–{MAX_TEACHERS})</Subtitle>
              <MultipleSelect
                value={selectedTeachers}
                items={teachers}
                onChange={handleChangeTeacher}
              />
            </div>
            <div>
              <Subtitle>Студенты</Subtitle>
              <div className={styles['student-picker']}>
                <div className={styles['student-picker__selects']}>
                  <CustomSelect
                    items={studentGroups}
                    placeholder="Группа"
                    onChange={handlePickStudentGroup}
                  />
                  <CustomSelect
                    key={`${studentGroupId}-${studentPickerKey}`}
                    items={studentsInGroup}
                    placeholder="Студент"
                    onChange={handlePickStudent}
                  />
                </div>
                {selectedStudents.length > 0 && (
                  <div className={styles['student-list']}>
                    {selectedStudents.map((student) => (
                      <div
                        key={student.id}
                        className={styles['student-list__chip']}
                        onClick={() => handleRemoveStudent(student.id)}
                      >
                        {student.name}
                        {student.group?.name ? ` (${student.group.name})` : ''}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <Subtitle>Место</Subtitle>
              <CustomSelect
                items={places}
                initValue={selectedPlace.name}
                onChange={handleChangePlace}
              />
            </div>
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <SecondaryButton onClick={handleClose}>Отмена</SecondaryButton>
        <PrimaryButton onClick={handleSubmit}>
          {classToEdit ? 'Сохранить' : 'Добавить'}
        </PrimaryButton>
      </ModalFooter>
    </Modal>
  );
}

export default memo(CreateClassModal);
