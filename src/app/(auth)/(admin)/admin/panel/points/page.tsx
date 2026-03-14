'use client';

import { useQuery } from '@apollo/client';
import AddPoints from '@/components/AddPoints/AddPoints';
import { Group } from '@/app/types';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Section from '@/components/Section/Section';
import Loader from '@/components/Loader/Loaader';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { UPDATE_GROUP } from '@/graphql/mutations/UpdateGroup';
import { GET_ACTIVE_SEASON } from '@/graphql/queries/GetActiveSeason';

function PointsPage() {
  const { loading, data, refetch } = useQuery(GET_ACTIVE_SEASON);
  const [updateGroup] = useGlobalLoadingMutation(UPDATE_GROUP);

  async function handleSaveGroups(changedGroups: Group[]) {
    try {
      await Promise.all(
        changedGroups.map((group) => {
          const original = data?.activeSeason?.groups.find((g: Group) => g.id === group.id);
          const amount = (group.points ?? 0) - (original?.points ?? 0);
          return updateGroup({ id: group.id, amount });
        }),
      );
      refetch();
    } catch (error) {
      console.error('Error saving points:', error);
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

  return (
    <CenteredContainer noPadding>
      <AddPoints groups={data?.activeSeason.groups as Group[]} onSave={handleSaveGroups} />
    </CenteredContainer>
  );
}

export default PointsPage;
