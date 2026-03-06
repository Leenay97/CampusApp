'use client';

import { useQuery } from '@apollo/client';
import { queries } from '@graphql/queries/index';
import AddPoints from '@/components/AddPoints/AddPoints';
import { useMutation } from '@apollo/client';
import { mutations } from '@graphql/mutations/index';
import { Group, LoadingType } from '@/app/types';
import { useState } from 'react';
import ModalLoading from '@/components/ModalLoading/ModalLoading';

function PointsPage() {
  const { loading, data, refetch } = useQuery(queries.GET_GROUPS);
  const [updateGroup] = useMutation(mutations.UPDATE_GROUP);
  const [someLoading, setSomeLoading] = useState<LoadingType>('NONE');

  async function handleSaveGroups(changedGroups: Group[]) {
    setSomeLoading('LOADING');
    try {
      await Promise.all(
        changedGroups.map((group) => {
          const original = data?.groups.find((g: Group) => g.id === group.id);
          const amount = (group.points ?? 0) - (original?.points ?? 0);
          return updateGroup({ variables: { id: group.id, amount } });
        }),
      );
      setSomeLoading('SUCCESS');
      refetch();
    } catch (error) {
      setSomeLoading('ERROR');
      console.error('Error saving points:', error);
    }
  }
  return (
    <div className="centered-container">
      <AddPoints groups={data?.groups as Group[]} onSave={handleSaveGroups} />
      {someLoading !== 'NONE' && (
        <ModalLoading onClose={() => setSomeLoading('NONE')} loadingState={someLoading} />
      )}
    </div>
  );
}

export default PointsPage;
