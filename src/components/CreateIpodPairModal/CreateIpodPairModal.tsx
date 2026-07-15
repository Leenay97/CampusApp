'use client';

import { useMemo, useState } from 'react';
import Modal from '../Modal/Modal';
import ModalHeader from '../Modal/ModalHeader';
import ModalBody from '../Modal/ModalBody';
import ModalFooter from '../Modal/ModalFooter';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import SecondaryButton from '../SecondaryButton/SecondaryButton';
import { CustomSelect } from '../CustomSelect/CustomSelect';
import { User } from '@/app/types';
import { buildPairName, firstName } from '@/utils/ipodPair';
import styles from './CreateIpodPairModal.module.scss';

type CreateIpodPairModalProps = {
  students: User[];
  onClose: () => void;
  onCreate: (name: string, studentIds: string[]) => Promise<void> | void;
};

export function CreateIpodPairModal({ students, onClose, onCreate }: CreateIpodPairModalProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<User[]>([]);
  const [pickerKey, setPickerKey] = useState(0);

  const groups = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    for (const student of students) {
      if (student.group) map.set(student.group.id, student.group);
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [students]);

  const studentsInGroup = useMemo(() => {
    const selectedIds = new Set(selectedStudents.map((student) => student.id));
    return students
      .filter((student) => student.group?.id === selectedGroupId && !selectedIds.has(student.id))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [students, selectedGroupId, selectedStudents]);

  function handlePickGroup(group: { id: string; name: string }) {
    setSelectedGroupId(group.id);
    setPickerKey((key) => key + 1);
  }

  function handlePickStudent(student: User) {
    if (!student?.id || selectedStudents.length >= 3) return;
    setSelectedStudents((prev) => [...prev, student]);
    setPickerKey((key) => key + 1);
  }

  function handleRemoveSelected(student: User) {
    setSelectedStudents((prev) => prev.filter((item) => item.id !== student.id));
  }

  const previewName = buildPairName(selectedStudents);
  const canCreate = selectedStudents.length >= 2 && selectedStudents.length <= 3;

  async function handleCreate() {
    if (!canCreate) return;
    await onCreate(
      previewName,
      selectedStudents.map((student) => student.id),
    );
  }

  return (
    <Modal onClose={onClose} className={styles['create-pair']}>
      <ModalHeader title="Добавить пару" onClose={onClose} />
      <ModalBody className={styles['create-pair__body']}>
        <CustomSelect items={groups} placeholder="Группа" onChange={handlePickGroup} />

        <CustomSelect
          key={`${selectedGroupId}-${pickerKey}`}
          items={studentsInGroup}
          placeholder="Студент"
          onChange={handlePickStudent}
        />

        <div className={styles['create-pair__selected']}>
          {selectedStudents.length === 0 && (
            <span className={styles['create-pair__hint']}>Выбери 2-3 студентов</span>
          )}
          {selectedStudents.map((student) => (
            <div
              key={student.id}
              className={styles['create-pair__chip']}
              onClick={() => handleRemoveSelected(student)}
            >
              {firstName(student)}
            </div>
          ))}
        </div>

        {selectedStudents.length > 0 && (
          <div className={styles['create-pair__name-preview']}>Название команды: {previewName}</div>
        )}
      </ModalBody>
      <ModalFooter>
        <SecondaryButton onClick={onClose}>Отмена</SecondaryButton>
        <PrimaryButton disabled={!canCreate} onClick={handleCreate}>
          Создать
        </PrimaryButton>
      </ModalFooter>
    </Modal>
  );
}
