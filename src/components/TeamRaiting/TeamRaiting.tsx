'use client';
import { memo, useMemo } from 'react';
import styles from './style.module.scss';
import Team from './Team/Team';
import { useQuery } from '@apollo/client';
import queries from '@/graphql/queries';

function TeamRaiting() {
  const { data, loading, error } = useQuery(queries.GET_GROUPS);

  const sortedGroups = useMemo(() => {
    const groups = data?.groups ?? [];
    return [...groups].sort((a, b) => b.points - a.points);
  }, [data]);

  if (loading) {
    return (
      <div className={styles['raiting']}>
        <h1 className="title">Рейтинг команд</h1>
        <div className={styles['loading']}>Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['raiting']}>
        <h1 className="title">Рейтинг команд</h1>
        <div className={styles['error']}>Ошибка загрузки</div>
      </div>
    );
  }

  return (
    <div className={styles['raiting']}>
      <h1 className="title">Рейтинг команд</h1>
      {sortedGroups.length > 0 ? (
        sortedGroups.map((team, index) => <Team key={team.name} team={team} place={index + 1} />)
      ) : (
        <div className={styles['empty']}>Нет команд</div>
      )}
    </div>
  );
}

export default memo(TeamRaiting);
