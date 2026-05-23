'use client';

import { Group } from '@/app/types';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Loader from '@/components/Loader/Loaader';
import Section from '@/components/Section/Section';
import Team from '@/components/TeamRaiting/Team/Team';
import Title from '@/components/Title/Title';
import { useApp } from '@/contexts/AppContext';
import { GET_SEASON_GROUPS } from '@/graphql/queries/GetSeasonGroups';
import { GET_TECHICAL_DATA } from '@/graphql/queries/GetTechnicalData';
import { useQuery } from '@apollo/client';
import { memo, useMemo } from 'react';

function RubbersPage() {
  const { app } = useApp();
  const { data, loading } = useQuery(GET_SEASON_GROUPS, { variables: { seasonId: app?.seasonId } });
  const { data: technicalData, loading: technicalDataLoading } = useQuery(GET_TECHICAL_DATA);

  const sortedGroups = useMemo(() => {
    if (!data?.seasonGroups.length) return [];
    return [...data?.seasonGroups].sort((a: Group, b: Group) => b.rubbers - a.rubbers);
  }, [data?.seasonGroups]);

  if (loading || technicalDataLoading) {
    return (
      <CenteredContainer>
        <Loader />
      </CenteredContainer>
    );
  }

  return (
    <CenteredContainer>
      <Section>
        <Title noMargin>Резиночки</Title>
        {sortedGroups.map((group: Group, index: number) => (
          <Team
            key={group.id}
            team={group}
            mode="rubbers"
            place={index + 1}
            hidden={!technicalData?.technicalData.isRatingShown}
          />
        ))}
      </Section>
    </CenteredContainer>
  );
}

export default memo(RubbersPage);
