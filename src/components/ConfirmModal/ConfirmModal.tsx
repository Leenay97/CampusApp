'use client';
import { memo, ReactNode } from 'react';
import Modal from '../Modal/Modal';
import ModalHeader from '../Modal/ModalHeader';
import ModalBody from '../Modal/ModalBody';
import ModalFooter from '../Modal/ModalFooter';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import SecondaryButton from '../SecondaryButton/SecondaryButton';

type ConfirmModalProps = {
  title: string;
  children: ReactNode;
  confirmText?: string;
  onConfirm: () => void;
  onClose: () => void;
};

function ConfirmModal({
  title,
  children,
  confirmText = 'Подтвердить',
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <Modal onClose={onClose}>
      <ModalHeader title={title} onClose={onClose} />
      <ModalBody>{children}</ModalBody>
      <ModalFooter>
        <SecondaryButton onClick={onClose}>Отмена</SecondaryButton>
        <PrimaryButton onClick={onConfirm}>{confirmText}</PrimaryButton>
      </ModalFooter>
    </Modal>
  );
}

export default memo(ConfirmModal);
