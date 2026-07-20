'use client';
import { memo, useState } from 'react';
import styles from './ChangePasswordModal.module.scss';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import SecondaryButton from '../SecondaryButton/SecondaryButton';
import { InputField } from '../InputField/InputField';
import Subtitle from '../Subtitle/Subtitle';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { CHANGE_PASSWORD } from '@/graphql/mutations/ChangePassword';
import Modal from '../Modal/Modal';
import ModalHeader from '../Modal/ModalHeader';
import ModalBody from '../Modal/ModalBody';
import ModalFooter from '../Modal/ModalFooter';

type ChangePasswordModalProps = {
  onClose: () => void;
};

type ChangePasswordResponse = {
  changePassword: boolean;
};

type ChangePasswordVariables = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const [changePassword, { loading }] = useGlobalLoadingMutation<
    ChangePasswordResponse,
    ChangePasswordVariables
  >(CHANGE_PASSWORD);

  const trim = (value: string) => value.replace(/\s+/g, '');

  async function handleSubmit() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Заполните все поля');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      setError('');
      await changePassword({ currentPassword, newPassword, confirmPassword });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сменить пароль');
    }
  }

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Сменить пароль" onClose={onClose} />

      <ModalBody>
        <div className={styles['field']}>
          <Subtitle>Текущий пароль*</Subtitle>
          <InputField
            width="100%"
            type="password"
            value={currentPassword}
            onChange={(v) => setCurrentPassword(trim(v))}
          />
        </div>

        <div className={styles['field']}>
          <Subtitle>Новый пароль*</Subtitle>
          <InputField
            width="100%"
            type="password"
            value={newPassword}
            onChange={(v) => setNewPassword(trim(v))}
          />
        </div>

        <div className={styles['field']}>
          <Subtitle>Подтверди новый пароль*</Subtitle>
          <InputField
            width="100%"
            type="password"
            value={confirmPassword}
            onChange={(v) => setConfirmPassword(trim(v))}
          />
        </div>

        {error && <div className="error-text">{error}</div>}
      </ModalBody>

      <ModalFooter>
        <SecondaryButton onClick={onClose}>Отмена</SecondaryButton>
        <PrimaryButton onClick={handleSubmit} disabled={loading}>
          Сохранить
        </PrimaryButton>
      </ModalFooter>
    </Modal>
  );
}

export default memo(ChangePasswordModal);
