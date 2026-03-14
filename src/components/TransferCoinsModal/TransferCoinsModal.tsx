'use client';
import { memo, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './style.module.scss';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@components/SecondaryButton/SecondaryButton';
import Title from '../Title/Title';
import { useQuery } from '@apollo/client';
import { GET_GROUPS } from '@/graphql/queries/GetGroups';
import { CustomSelect } from '../CustomSelect/CustomSelect';
import { GET_ACTIVE_SEASON } from '@/graphql/queries/GetActiveSeason';
import Subtitle from '../Subtitle/Subtitle';
import { GET_STUDENTS_BY_GROUP_ID } from '@/graphql/queries/GetStudentsByGroupId';
import { InputField } from '../InputField/InputField';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { TRANSFER_COINS } from '@/graphql/mutations/TransferCoins';
import { useUser } from '@/contexts/UserContext';

type ModalProps = {
  onClose: () => void;
};

function TransferCoinsModal({ onClose }: ModalProps) {
  const [selectedGroup, setSelectedGroup] = useState({ id: '', name: '' });
  const [selectedStudent, setSelectedStudent] = useState({ id: '', name: '' });
  const [coins, setCoins] = useState('');
  const { data: groupsData, loading: groupsLoading } = useQuery(GET_ACTIVE_SEASON);
  const { user } = useUser();

  const { data: studentsData, loading: studentsLoading } = useQuery(GET_STUDENTS_BY_GROUP_ID, {
    variables: { groupId: selectedGroup.id },
    skip: !selectedGroup.id,
  });

  const [transferCoins] = useGlobalLoadingMutation(TRANSFER_COINS);

  if (typeof window === 'undefined') return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  function handleChangeGroup({ id, name }: { id: string; name: string }) {
    setSelectedGroup({ id, name });
    setSelectedStudent({ id: '', name: '' });
    setCoins('');
  }

  async function transfer() {
    try {
      await transferCoins({
        userId: user?.id,
        recieverId: selectedStudent.id,
        amount: Number(coins),
      });
      setSelectedGroup({ id: '', name: '' });
      setSelectedStudent({ id: '', name: '' });
      setCoins('');
      onClose();
    } catch (err) {
      console.log(err);
    }
  }

  return createPortal(
    <div className={styles['modal']} onClick={handleOverlayClick}>
      <div className={styles['modal__content']} onClick={handleContentClick}>
        <div className={styles['modal__header']}>
          <Title>Перевести Coins</Title>
          <div className={styles['close-button']} onClick={onClose}>
            &times;
          </div>
        </div>
        <div className={styles['modal__body']}>
          <Subtitle>Группа</Subtitle>
          <CustomSelect items={groupsData?.activeSeason?.groups} onChange={handleChangeGroup} />
          {studentsData?.students.length > 0 && (
            <>
              <Subtitle>Студент</Subtitle>
              <CustomSelect items={studentsData?.students} onChange={setSelectedStudent} />
            </>
          )}
          {selectedGroup.id && selectedStudent.id && (
            <>
              <Subtitle>Сумма</Subtitle>
              <InputField value={coins} onChange={setCoins} />
            </>
          )}
        </div>
        <div className={styles['modal__footer']}>
          <SecondaryButton onClick={onClose}>Отмена</SecondaryButton>
          <PrimaryButton onClick={transfer}>Перевести</PrimaryButton>
        </div>
      </div>
    </div>,
    modalRoot,
  );
}

export default memo(TransferCoinsModal);
