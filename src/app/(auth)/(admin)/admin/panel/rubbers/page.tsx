'use client';

import { useQuery } from '@apollo/client';
import AddRubbers from '@/components/AddRubbers/AddRubbers';
import { Group } from '@/app/types';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Section from '@/components/Section/Section';
import Loader from '@/components/Loader/Loaader';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { UPDATE_GROUP } from '@/graphql/mutations/UpdateGroup';
import { GET_SEASON_GROUPS } from '@/graphql/queries/GetSeasonGroups';
import { useApp } from '@/contexts/AppContext';

function AdminRubbersPage() {
  const { app } = useApp();
  const { loading, data, refetch } = useQuery(GET_SEASON_GROUPS, {
    variables: { seasonId: app?.seasonId },
    skip: !app?.seasonId,
  });
  const [updateGroup] = useGlobalLoadingMutation(UPDATE_GROUP);

  async function handleSaveGroups(changedGroups: Group[]) {
    try {
      await Promise.all(
        changedGroups.map((group) => {
          const original = data?.seasonGroups.find((g: Group) => g.id === group.id);
          const rubbersAmount = (group.rubbers ?? 0) - (original?.rubbers ?? 0);
          return updateGroup({ id: group.id, rubbersAmount });
        }),
      );
      refetch();
    } catch (error) {
      console.error('Error saving rubbers:', error);
    }
  }

  if (!app || loading)
    return (
      <CenteredContainer>
        <Section>
          <Loader />
        </Section>
      </CenteredContainer>
    );

  return (
    <CenteredContainer noPaddingTop>
      <AddRubbers groups={data?.seasonGroups as Group[]} onSave={handleSaveGroups} />
    </CenteredContainer>
  );
}

export default AdminRubbersPage;
