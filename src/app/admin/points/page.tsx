'use client';

import { useQuery } from '@apollo/client';
import { queries } from '@graphql/queries/index';
import AddPoints from '@/components/AddPoints/AddPoints';
import { useMutation } from '@apollo/client';
import { mutations } from '@graphql/mutations/index';

function PointsPage() {
  const { loading, data, refetch } = useQuery(queries.GET_GROUPS);
  const [addPoints] = useMutation(mutations.ADD_POINTS);

  async function handleAddPoints(id: string, amount: number) {
    try {
      await addPoints({ variables: { id, amount } });
      refetch();
    } catch (error) {
      console.error('Error adding points:', error);
    }
  }
  return (
    <div className="centered-container">
      <AddPoints groups={data?.groups as Group[]} onAdd={handleAddPoints} />
    </div>
  );
}

export default PointsPage;
