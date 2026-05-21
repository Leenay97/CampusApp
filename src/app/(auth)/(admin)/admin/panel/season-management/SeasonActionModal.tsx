import Modal from '@/components/Modal/Modal';
import ModalBody from '@/components/Modal/ModalBody';
import ModalFooter from '@/components/Modal/ModalFooter';
import ModalHeader from '@/components/Modal/ModalHeader';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@/components/SecondaryButton/SecondaryButton';
import { memo } from 'react';

type SeasonActionModalProps = {
  action: 'archive' | 'activate';
  seasonName: string;
  onClose: () => void;
  handleSubmit: () => void;
};

function SeasonActionModal({ action, seasonName, onClose, handleSubmit }: SeasonActionModalProps) {
  const modalTitle = action === 'archive' ? 'Архивировать сезон?' : 'Активировать сезон?';

  const warningTextActive = `Вы уверены, что хотите активировать ${seasonName}? После активации создать и изменить группы будет невозможно`;
  const warningTextArchive = `Вы уверены, что хотите архивировать ${seasonName}? После архивирования сезон станет недоступен. Информацию о нем можно будет увидеть в разделе "Архив"`;

  const modalText = action === 'archive' ? warningTextArchive : warningTextActive;

  return (
    <Modal onClose={onClose}>
      <ModalHeader onClose={onClose} title={modalTitle} />
      <ModalBody>{modalText}</ModalBody>
      <ModalFooter>
        <SecondaryButton onClick={onClose}>Отмена</SecondaryButton>
        <PrimaryButton onClick={handleSubmit}>
          {action === 'archive' ? 'Архивировать' : 'Активировать'}
        </PrimaryButton>
      </ModalFooter>
    </Modal>
  );
}

export default memo(SeasonActionModal);
