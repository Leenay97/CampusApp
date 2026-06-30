'use client';

import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import { JSX, useState } from 'react';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import AddElectionModal from '@/components/AddElectionModal/AddElectionModal';
import { useQuery } from '@apollo/client';
import { GET_VOTES } from '@/graphql/queries/GetVote';
import { useApp } from '@/contexts/AppContext';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { CREATE_VOTE } from '@/graphql/mutations/CreateVote';
import Election from '@/components/Election/Election';
import { Vote } from '@/app/types';

export default function ElectionPage(): JSX.Element {
  const [openModal, setIsOpenModal] = useState(false);
  const { app } = useApp();

  const { data, loading, error, refetch } = useQuery(GET_VOTES, {
    skip: !app?.seasonId,
    variables: app?.seasonId ? { seasonId: app.seasonId } : undefined,
  });

  const [createVote] = useGlobalLoadingMutation(CREATE_VOTE, {
    onCompleted: () => {
      refetch();
    },
  });

  function handleOpenModal() {
    setIsOpenModal(true);
  }

  function handleCloseModal() {
    setIsOpenModal(false);
  }

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error.message}</div>;

  return (
    <CenteredContainer wide noPadding>
      <PrimaryButton onClick={handleOpenModal}>Добавить</PrimaryButton>

      {data?.getVotes?.map((vote: Vote) => (
        <Election key={vote.id} election={vote} adminMode />
      ))}

      {openModal && <AddElectionModal onClose={handleCloseModal} onCreate={createVote} />}
    </CenteredContainer>
  );
}
