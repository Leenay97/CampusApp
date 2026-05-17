'use client';
import { memo } from 'react';
import { useUser } from '@/contexts/UserContext';
import { QRCodeCanvas } from 'qrcode.react';
import Modal from '../Modal/Modal';
import ModalHeader from '../Modal/ModalHeader';
import ModalBody from '../Modal/ModalBody';

type ModalProps = {
  onClose: () => void;
};

function QRModal({ onClose }: ModalProps) {
  const { user } = useUser();

  const qrValue = String(user?.id);

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Мой QR" onClose={onClose} />
      <ModalBody>
        {' '}
        <QRCodeCanvas value={qrValue} size={200} />
      </ModalBody>
    </Modal>
  );
}

export default memo(QRModal);
