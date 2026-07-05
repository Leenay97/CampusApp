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
import { SET_VOTE_STATUS } from '@/graphql/mutations/SetVoteStatus';
import { DELETE_VOTE } from '@/graphql/mutations/DeleteVote';
import Election from '@/components/Election/Election';
import Loader from '@/components/Loader/Loaader';
import Section from '@/components/Section/Section';
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

  const [setVoteStatus] = useGlobalLoadingMutation(SET_VOTE_STATUS, {
    onCompleted: () => {
      refetch();
    },
  });

  const [deleteVote] = useGlobalLoadingMutation(DELETE_VOTE, {
    onCompleted: () => {
      refetch();
    },
  });

  function handleDelete(vote: Vote) {
    if (window.confirm(`Удалить голосование «${vote.title}»?`)) {
      deleteVote({ id: vote.id });
    }
  }

  function handleOpenModal() {
    setIsOpenModal(true);
  }

  function handleCloseModal() {
    setIsOpenModal(false);
  }

  if (loading)
    return (
      <CenteredContainer>
        <Section>
          <Loader />
        </Section>
      </CenteredContainer>
    );
  if (error) return <div>Ошибка: {error.message}</div>;

  return (
    <CenteredContainer wide noPadding>
      <PrimaryButton onClick={handleOpenModal}>Добавить</PrimaryButton>

      {data?.getVotes?.map((vote: Vote) => (
        <Election
          key={vote.id}
          election={vote}
          adminMode
          onStart={() => setVoteStatus({ id: vote.id, status: 'ACTIVE' })}
          onFinish={() => setVoteStatus({ id: vote.id, status: 'FINISHED' })}
          onDelete={() => handleDelete(vote)}
        />
      ))}

      {openModal && <AddElectionModal onClose={handleCloseModal} onCreate={createVote} />}
    </CenteredContainer>
  );
}
