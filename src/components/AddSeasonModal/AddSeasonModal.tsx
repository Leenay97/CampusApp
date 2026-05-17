'use client';
import { memo, useState } from 'react';
import styles from './AddSeasonModal.module.scss';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@components/SecondaryButton/SecondaryButton';
import 'easymde/dist/easymde.min.css';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { AddSeason } from '../AddSeason/AddSeason';
import mutations from '@/graphql/mutations';
import Modal from '../Modal/Modal';
import ModalHeader from '../Modal/ModalHeader';
import ModalBody from '../Modal/ModalBody';
import ModalFooter from '../Modal/ModalFooter';

type ModalProps = {
  onClose: () => void;
};

function AddSeasonModal({ onClose }: ModalProps) {
  const [seasonData, setSeasonData] = useState({
    year: '',
    number: '',
    startDate: '',
    endDate: '',
  });

  const [createSeason] = useGlobalLoadingMutation(mutations.CREATE_SEASON);

  function handleClose() {
    onClose();
  }

  async function handleCreateSeason() {
    try {
      await createSeason({
        year: seasonData.year,
        number: seasonData.number,
        startDate: seasonData.startDate,
        endDate: seasonData.endDate,
      });
    } catch (err) {
      console.error(err);
    }
  }

  function handleChangeSeasonData(
    year: string,
    number: string,
    startDate: string,
    endDate: string,
  ) {
    setSeasonData({ year, number, startDate, endDate });
  }

  return (
    <Modal className={styles['add-season-modal']} onClose={onClose}>
      <ModalHeader title="Добавить сезон" onClose={onClose} />

      <ModalBody>
        <AddSeason
          year={seasonData.year}
          number={seasonData.number}
          startDate={seasonData.startDate}
          endDate={seasonData.endDate}
          onChange={handleChangeSeasonData}
        />
      </ModalBody>
      <ModalFooter>
        <SecondaryButton onClick={handleClose}>Отмена</SecondaryButton>
        <PrimaryButton onClick={handleCreateSeason}>Добавить</PrimaryButton>
      </ModalFooter>
    </Modal>
  );
}

export default memo(AddSeasonModal);
