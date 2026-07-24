'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { InputField } from '../InputField/InputField';
import Modal from '../Modal/Modal';
import ModalBody from '../Modal/ModalBody';
import ModalFooter from '../Modal/ModalFooter';
import ModalHeader from '../Modal/ModalHeader';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import ElectionOption from './ElectionOption';
import styles from './AddElectionModal.module.scss';
import ActionButton from '../ActionButton/ActionButton';
import { useApp } from '@/contexts/AppContext';
import { GET_ACTIVE_SEASON } from '@/graphql/queries/GetActiveSeason';
import { Vote } from '@/app/types';

type AddElectionModalProps = {
  onClose: () => void;
  onSubmit: (variables?: Record<string, unknown> | undefined) => Promise<unknown>;
  election?: Vote | null;
};

type OptionType = {
  id: string;
  name: string;
  groupId?: string;
  groupName?: string;
  votesNumber?: number;
};

let idCounter = 0;

function generateId() {
  return String(++idCounter);
}

export default function AddElectionModal({ onClose, onSubmit, election }: AddElectionModalProps) {
  const { app } = useApp();
  const isEditing = Boolean(election);
  const [title, setTitle] = useState(election?.title ?? '');
  const [options, setOptions] = useState<OptionType[]>(() =>
    election?.options?.length
      ? election.options.map((opt) => ({
          id: opt.id,
          name: opt.name,
          groupId: opt.groupId ?? undefined,
          groupName: opt.group?.name ?? undefined,
          votesNumber: opt.votesNumber,
        }))
      : [{ id: generateId(), name: '' }],
  );
  const [isLoading, setIsLoading] = useState(false);
  const optionsContainerRef = useRef<HTMLDivElement>(null);
  const lastOptionRef = useRef<HTMLDivElement>(null);
  const { data: seasonData } = useQuery(GET_ACTIVE_SEASON);
  const groups = seasonData?.activeSeason?.groups || [];

  const handleChangeOption = useCallback((id: string, value: string) => {
    setOptions((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          return { ...item, name: value };
        }
        return item;
      });
    });
  }, []);

  const handleChangeOptionGroup = useCallback((id: string, group: { id: string; name: string }) => {
    setOptions((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          return { ...item, groupId: group.id, groupName: group.name };
        }
        return item;
      });
    });
  }, []);

  const handleAddOption = useCallback(() => {
    if (!options.at(-1)?.name && options.length) {
      return;
    }
    setOptions((prev) => [...prev, { id: generateId(), name: '' }]);
  }, [options]);

  const handleRemoveOption = useCallback((id: string) => {
    setOptions((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      alert('Введите название голосования');
      return;
    }

    const validOptions = options.filter((opt) => opt.name.trim());
    if (validOptions.length < 2) {
      alert('Добавьте минимум 2 опции');
      return;
    }

    if (!isEditing && !app?.seasonId) {
      alert('Season ID не найден');
      return;
    }

    setIsLoading(true);

    const payloadOptions = validOptions.map((opt) => ({
      name: opt.name.trim(),
      groupId: opt.groupId || null,
      votesNumber: opt.votesNumber || 0,
    }));

    try {
      if (isEditing && election) {
        await onSubmit({ id: election.id, title: title.trim(), options: payloadOptions });
      } else {
        await onSubmit({ title: title.trim(), options: payloadOptions, seasonId: app?.seasonId });
      }

      onClose();
    } catch (error) {
      console.error('Error saving vote:', error);
      alert(isEditing ? 'Ошибка при сохранении голосования' : 'Ошибка при создании голосования');
    } finally {
      setIsLoading(false);
    }
  }, [title, options, isEditing, election, app?.seasonId, onSubmit, onClose]);

  // Автофокус на последнем поле
  useEffect(() => {
    if (lastOptionRef.current) {
      lastOptionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [options.length]);

  return (
    <Modal onClose={onClose} className={styles['modal']}>
      <ModalHeader
        onClose={onClose}
        title={isEditing ? 'Редактировать голосование' : 'Новое голосование'}
      />
      <ModalBody>
        <InputField value={title} onChange={setTitle} placeholder="Название голосования" />
        <div className={styles['modal__options']} ref={optionsContainerRef}>
          {options.map((option, index) => (
            <div key={option.id} ref={index === options.length - 1 ? lastOptionRef : null}>
              <ElectionOption
                id={option.id}
                name={option.name}
                onChangeName={(value) => handleChangeOption(option.id, value)}
                placeholder={`Опция ${index + 1}`}
                onRemove={handleRemoveOption}
                groups={groups}
                groupName={option.groupName}
                onChangeGroup={(group) => handleChangeOptionGroup(option.id, group)}
              />
            </div>
          ))}
        </div>
        <div className={styles['modal__add']}>
          <ActionButton type="ADD" onClick={handleAddOption} title="Добавить опцию" />
        </div>
      </ModalBody>
      <ModalFooter>
        <PrimaryButton
          onClick={handleSubmit}
          disabled={isLoading || !title.trim() || options.filter((o) => o.name.trim()).length < 2}
        >
          {isLoading ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Добавить'}
        </PrimaryButton>
      </ModalFooter>
    </Modal>
  );
}
