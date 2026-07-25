'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Section from '@/components/Section/Section';
import Title from '@/components/Title/Title';
import Subtitle from '@/components/Subtitle/Subtitle';
import Loader from '@/components/Loader/Loaader';
import { InputField } from '@/components/InputField/InputField';
import LifeFineHistoryTable, {
  GroupFineRow,
} from '@/components/LifeFineHistoryTable/LifeFineHistoryTable';
import { GET_LIFE_FINE_HISTORY } from '@/graphql/queries/GetLifeFineHistory';
import { GET_SEASON_GROUPS } from '@/graphql/queries/GetSeasonGroups';
import { GET_ACTIVE_SEASON } from '@/graphql/queries/GetActiveSeason';
import { LifeFineHistoryEntry } from '@/app/types';
import { useApp } from '@/contexts/AppContext';
import styles from './LifeFines.module.scss';

function formatLocalDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

export default function LifeFinesPage() {
  const { app } = useApp();
  const [selectedDate, setSelectedDate] = useState(() => formatLocalDate(new Date()));
  const { data: groupsData, loading: groupsLoading } = useQuery(GET_SEASON_GROUPS, {
    variables: { seasonId: app?.seasonId },
    skip: !app?.seasonId,
  });
  const { data: historyData, loading: historyLoading } = useQuery(GET_LIFE_FINE_HISTORY);
  const { data: seasonData } = useQuery(GET_ACTIVE_SEASON);

  const seasonRange = useMemo(() => {
    const startTimestamp = Number(seasonData?.activeSeason?.startDate);
    const endTimestamp = Number(seasonData?.activeSeason?.endDate);
    if (!startTimestamp || !endTimestamp) return null;

    return {
      min: formatLocalDate(new Date(startTimestamp)),
      max: formatLocalDate(new Date(endTimestamp)),
    };
  }, [seasonData]);

  const effectiveDate = useMemo(() => {
    if (!seasonRange) return selectedDate;
    if (selectedDate < seasonRange.min) return seasonRange.min;
    if (selectedDate > seasonRange.max) return seasonRange.max;
    return selectedDate;
  }, [selectedDate, seasonRange]);

  const rows = useMemo(() => {
    const byGroup = new Map<string, GroupFineRow>();

    (groupsData?.seasonGroups ?? []).forEach((group: { id: string; name: string }) => {
      byGroup.set(group.id, {
        group: { id: group.id, name: group.name },
        total: 0,
        allTimeTotal: 0,
        students: [],
      });
    });

    (historyData?.lifeFineHistory ?? []).forEach((entry: LifeFineHistoryEntry) => {
      const group = entry.student?.group;
      if (!group) return;

      const existing = byGroup.get(group.id) ?? {
        group,
        total: 0,
        allTimeTotal: 0,
        students: [],
      };
      existing.allTimeTotal += entry.count;

      if (entry.date === effectiveDate) {
        existing.total += entry.count;
        const studentName = entry.student.name || entry.student.russianName || '';
        existing.students.push(`${studentName} (${entry.count})`);
      }

      byGroup.set(group.id, existing);
    });

    return [...byGroup.values()];
  }, [groupsData, historyData, effectiveDate]);

  if (groupsLoading || historyLoading)
    return (
      <CenteredContainer>
        <Section>
          <Loader />
        </Section>
      </CenteredContainer>
    );

  return (
    <CenteredContainer noPaddingTop>
      <Section>
        <Title noMargin>Отнятые жизни</Title>
        <div className={styles['date-select']}>
          <Subtitle noMargin>Дата</Subtitle>
          <InputField
            type="date"
            value={effectiveDate}
            onChange={setSelectedDate}
            min={seasonRange?.min}
            max={seasonRange?.max}
            width="180px"
          />
        </div>
        <LifeFineHistoryTable rows={rows} />
      </Section>
    </CenteredContainer>
  );
}
