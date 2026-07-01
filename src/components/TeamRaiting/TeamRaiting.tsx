'use client';
import { memo, useMemo } from 'react';
import styles from './TeamRaiting.module.scss';
import Team from './Team/Team';
import { useQuery } from '@apollo/client';
import { GET_ACTIVE_SEASON } from '@/graphql/queries/GetActiveSeason';
import Section from '../Section/Section';
import Title from '../Title/Title';
import { GET_TECHICAL_DATA } from '@/graphql/queries/GetTechnicalData';
import CenteredContainer from '../CenteredContainer/CenteredContainer';
import Loader from '../Loader/Loaader';

function TeamRaiting() {
  const { data, loading } = useQuery(GET_ACTIVE_SEASON);
  const { data: technicalData, loading: technicalDataLoading } = useQuery(GET_TECHICAL_DATA);

  const sortedGroups = useMemo(() => {
    const groups = data?.activeSeason?.groups ?? [];
    return [...groups].sort((a, b) => b.points - a.points);
  }, [data]);

  if (loading || technicalDataLoading) {
    return (
      <CenteredContainer noPadding>
        <Section>
          <Loader />
        </Section>
      </CenteredContainer>
    );
  }

  return (
    <CenteredContainer noPadding>
      <Section>
        <Title noMargin>Рейтинг команд</Title>
        {sortedGroups.length > 0 ? (
          sortedGroups.map((team, index) => (
            <Team
              key={team.id}
              team={team}
              place={index + 1}
              hidden={!technicalData?.technicalData.isRatingShown}
            />
          ))
        ) : (
          <div className={styles['empty']}>Нет команд</div>
        )}
      </Section>
    </CenteredContainer>
  );
}

export default memo(TeamRaiting);
