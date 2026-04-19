'use client';
import { memo, useMemo } from 'react';
import styles from './style.module.scss';
import Team from './Team/Team';
import { useQuery } from '@apollo/client';
import { GET_ACTIVE_SEASON } from '@/graphql/queries/GetActiveSeason';
import Section from '../Section/Section';
import Title from '../Title/Title';
import { GET_TECHICAL_DATA } from '@/graphql/queries/GetTechnicalData';

function TeamRaiting() {
  const { data, loading, error } = useQuery(GET_ACTIVE_SEASON);
  const { data: technicalData, loading: technicalDataLoading } = useQuery(GET_TECHICAL_DATA);

  const sortedGroups = useMemo(() => {
    const groups = data?.activeSeason?.groups ?? [];
    return [...groups].sort((a, b) => b.points - a.points);
  }, [data]);

  if (loading || technicalDataLoading) {
    return (
      <div className={styles['raiting']}>
        <Title>Рейтинг команд</Title>
        <div className={styles['loading']}>Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['raiting']}>
        <Title>Рейтинг команд</Title>
        <div className={styles['error']}>Ошибка загрузки</div>
      </div>
    );
  }

  return (
    <Section>
      <div className={styles['raiting']}>
        <Title>Рейтинг команд</Title>
        {sortedGroups.length > 0 ? (
          sortedGroups.map((team, index) => (
            <Team
              key={team.name}
              team={team}
              place={index + 1}
              hidden={!technicalData?.technicalData.isRatingShown}
            />
          ))
        ) : (
          <div className={styles['empty']}>Нет команд</div>
        )}
      </div>
    </Section>
  );
}

export default memo(TeamRaiting);
