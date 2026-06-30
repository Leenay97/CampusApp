'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
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

type AddElectionModalProps = {
  onClose: () => void;
  onCreate: (variables?: Record<string, unknown> | undefined) => Promise<unknown>;
};

type OptionType = {
  id: string;
  name: string;
};

let idCounter = 0;

function generateId() {
  return String(++idCounter);
}

export default function AddElectionModal({ onClose, onCreate }: AddElectionModalProps) {
  const { app } = useApp();
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState<OptionType[]>([{ id: generateId(), name: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const optionsContainerRef = useRef<HTMLDivElement>(null);
  const lastOptionRef = useRef<HTMLDivElement>(null);

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

  const handleCreate = useCallback(async () => {
    if (!title.trim()) {
      alert('Введите название голосования');
      return;
    }

    const validOptions = options.filter((opt) => opt.name.trim());
    if (validOptions.length < 2) {
      alert('Добавьте минимум 2 опции');
      return;
    }

    if (!app?.seasonId) {
      alert('Season ID не найден');
      return;
    }

    setIsLoading(true);

    try {
      await onCreate({
        title: title.trim(),
        options: validOptions.map((opt) => ({ name: opt.name.trim() })),
        seasonId: app.seasonId,
      });

      setTitle('');
      setOptions([{ id: generateId(), name: '' }]);
      onClose();
    } catch (error) {
      console.error('Error creating vote:', error);
      alert('Ошибка при создании голосования');
    } finally {
      setIsLoading(false);
    }
  }, [title, options, app?.seasonId, onCreate, onClose]);

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
      <ModalHeader onClose={onClose} title="Новое голосование" />
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
          onClick={handleCreate}
          disabled={isLoading || !title.trim() || options.filter((o) => o.name.trim()).length < 2}
        >
          {isLoading ? 'Создание...' : 'Добавить'}
        </PrimaryButton>
      </ModalFooter>
    </Modal>
  );
}
