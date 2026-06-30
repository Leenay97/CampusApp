'use client';
import { JSX } from 'react';
import { useQuery } from '@apollo/client';
import queries from '@/graphql/queries';
import mutations from '@/graphql/mutations';
import { useApp } from '@/contexts/AppContext';
import { useUser } from '@/contexts/UserContext';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Section from '@/components/Section/Section';
import Title from '@/components/Title/Title';
import Loader from '@/components/Loader/Loaader';
import Election from '@/components/Election/Election';
import { Vote as VoteType } from '@/app/types';

export default function ElectionPage(): JSX.Element {
  const { app } = useApp();
  const { user } = useUser();

  const { data, loading, refetch } = useQuery(queries.GET_VOTES_FOR_VOTING, {
    skip: !app?.seasonId || !user?.id,
    variables: app?.seasonId && user?.id ? { seasonId: app.seasonId, userId: user.id } : undefined,
  });

  const [castVote] = useGlobalLoadingMutation(mutations.CAST_VOTE, {
    onCompleted: () => refetch(),
  });

  async function handleVote(voteId: string, optionId: string) {
    try {
      await castVote({ voteId, optionId, userId: user?.id });
    } catch (error) {
      console.error(error);
    }
  }

  if (loading)
    return (
      <CenteredContainer>
        <Section>
          <Loader />
        </Section>
      </CenteredContainer>
    );

  if (!data?.getVotes?.length) {
    return (
      <CenteredContainer>
        <Section>
          <Title noMargin>Голосований еще нет</Title>
        </Section>
      </CenteredContainer>
    );
  }

  return (
    <CenteredContainer>
      {data.getVotes.map((vote: VoteType) => (
        <Election
          key={vote.id}
          election={vote}
          onVote={(optionId) => handleVote(vote.id, optionId)}
        />
      ))}
    </CenteredContainer>
  );
}
