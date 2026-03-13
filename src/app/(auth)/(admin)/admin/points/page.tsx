'use client';

import { useQuery } from '@apollo/client';
import { queries } from '@graphql/queries/index';
import AddPoints from '@/components/AddPoints/AddPoints';
import { Group } from '@/app/types';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Section from '@/components/Section/Section';
import Loader from '@/components/Loader/Loaader';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { UPDATE_GROUP } from '@/graphql/mutations/UpdateGroup';

function PointsPage() {
  const { loading, data, refetch } = useQuery(queries.GET_GROUPS);
  const [updateGroup] = useGlobalLoadingMutation(UPDATE_GROUP);

  async function handleSaveGroups(changedGroups: Group[]) {
    try {
      await Promise.all(
        changedGroups.map((group) => {
          const original = data?.groups.find((g: Group) => g.id === group.id);
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
    <CenteredContainer>
      <AddPoints groups={data?.groups as Group[]} onSave={handleSaveGroups} />
    </CenteredContainer>
  );
}

export default PointsPage;
