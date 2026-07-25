'use client';

import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Section from '@/components/Section/Section';
import Title from '@/components/Title/Title';
import Loader from '@/components/Loader/Loaader';
import LifeFineHistoryTable, {
  GroupFineRow,
} from '@/components/LifeFineHistoryTable/LifeFineHistoryTable';
import { GET_LIFE_FINE_HISTORY } from '@/graphql/queries/GetLifeFineHistory';
import { GET_SEASON_GROUPS } from '@/graphql/queries/GetSeasonGroups';
import { LifeFineHistoryEntry } from '@/app/types';
import { useApp } from '@/contexts/AppContext';

function formatLocalDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

export default function LifeFinesPage() {
  const { app } = useApp();
  const { data: groupsData, loading: groupsLoading } = useQuery(GET_SEASON_GROUPS, {
    variables: { seasonId: app?.seasonId },
    skip: !app?.seasonId,
  });
  const { data: historyData, loading: historyLoading } = useQuery(GET_LIFE_FINE_HISTORY);

  const rows = useMemo(() => {
    const today = formatLocalDate(new Date());
    const byGroup = new Map<string, GroupFineRow>();

    (groupsData?.seasonGroups ?? []).forEach((group: { id: string; name: string }) => {
      byGroup.set(group.id, { group: { id: group.id, name: group.name }, total: 0, students: [] });
    });

    (historyData?.lifeFineHistory ?? []).forEach((entry: LifeFineHistoryEntry) => {
      if (entry.date !== today) return;
      const group = entry.student?.group;
      if (!group) return;

      const existing = byGroup.get(group.id) ?? { group, total: 0, students: [] };
      existing.total += entry.count;
      existing.students.push(entry.student.name || entry.student.russianName || '');
      byGroup.set(group.id, existing);
    });

    return [...byGroup.values()];
  }, [groupsData, historyData]);

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
        <LifeFineHistoryTable rows={rows} />
      </Section>
    </CenteredContainer>
  );
}
