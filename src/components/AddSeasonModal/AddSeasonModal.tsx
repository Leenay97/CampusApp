'use client';
import { memo, useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import styles from './AddSeasonModal.module.scss';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@components/SecondaryButton/SecondaryButton';
import Title from '../Title/Title';
import 'easymde/dist/easymde.min.css';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { CREATE_POST } from '@/graphql/mutations/CreatePost';
import Section from '../Section/Section';
import { AddSeason } from '../AddSeason/AddSeason';
import { AddGroup } from '../AddGroup/AddGroup';
import { GroupsList } from '../GroupsList/GroupsList';
import mutations from '@/graphql/mutations';
import queries from '@/graphql/queries';
import { useQuery } from '@apollo/client';
import { GroupInput, Teacher } from '@/app/types';

type ModalProps = {
  onClose: () => void;
  onSubmit: () => void;
};

function AddSeasonModal({ onClose, onSubmit }: ModalProps) {
  const [title, setTitle] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const [seasonGroups, setSeasonGroups] = useState<GroupInput[]>([]);
  const [seasonData, setSeasonData] = useState({
    year: '',
    number: '',
    startDate: '',
    endDate: '',
  });
  const [createPost] = useGlobalLoadingMutation(CREATE_POST);

  const { loading: teachersLoading, data: teachersData } = useQuery(queries.GET_TEACHERS);
  const {
    loading: seasonLoading,
    data: seasonsData,
    refetch: refetchSeasons,
  } = useQuery(queries.GET_SEASONS);

  const [createSeason] = useGlobalLoadingMutation(mutations.CREATE_SEASON);

  useEffect(() => {
    /*eslint-disable-next-line react-hooks/set-state-in-effect*/
    setMounted(true);
  }, []);

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  function handleClose() {
    onClose();
  }

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  async function handleSubmit() {
    try {
      await createPost({
        text,
        title,
      });
      onSubmit();
    } catch (error) {
      console.error('Error creating workshop:', error);
    }
  }

  async function handleCreateSeason() {
    try {
      await createSeason({
        year: seasonData.year,
        number: seasonData.number,
        startDate: seasonData.startDate,
        endDate: seasonData.endDate,
        groupTeachers: seasonGroups,
      });
      refetchSeasons();
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

  return createPortal(
    <div className={styles['modal']}>
      <div className={styles['modal__content']} onClick={handleContentClick}>
        <div className={styles['modal__header']}>
          <Title>Добавить сезон</Title>
          <div className={styles['close-button']} onClick={onClose}>
            &times;
          </div>
        </div>
        <div className={styles['modal__body']}>
          <AddSeason
            year={seasonData.year}
            number={seasonData.number}
            startDate={seasonData.startDate}
            endDate={seasonData.endDate}
            onChange={handleChangeSeasonData}
          />
        </div>
        <div className={styles['modal__footer']}>
          <SecondaryButton onClick={handleClose}>Отмена</SecondaryButton>
          <PrimaryButton onClick={handleCreateSeason}>Добавить</PrimaryButton>
        </div>
      </div>
    </div>,
    modalRoot,
  );
}

export default memo(AddSeasonModal);
