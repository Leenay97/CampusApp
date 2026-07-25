'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Section from '@/components/Section/Section';
import Title from '@/components/Title/Title';
import Subtitle from '@/components/Subtitle/Subtitle';
import Loader from '@/components/Loader/Loaader';
import { InputField } from '@/components/InputField/InputField';
import HouseGradeHistoryTable from '@/components/HouseGradeHistoryTable/HouseGradeHistoryTable';
import { GET_HOUSES } from '@/graphql/queries/GetHouses';
import { GET_HOUSE_GRADE_HISTORY } from '@/graphql/queries/GetHouseGradeHistory';
import { GET_ACTIVE_SEASON } from '@/graphql/queries/GetActiveSeason';
import { HouseGradeHistoryEntry } from '@/app/types';
import styles from './HouseHistory.module.scss';

function formatLocalDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

export default function HouseHistoryPage() {
  const [selectedDate, setSelectedDate] = useState(() => formatLocalDate(new Date()));
  const { data: housesData, loading: housesLoading } = useQuery(GET_HOUSES);
  const { data: historyData, loading: historyLoading } = useQuery(GET_HOUSE_GRADE_HISTORY);
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

  const gradeByHouseId = useMemo(() => {
    const map: Record<string, number | undefined> = {};
    (historyData?.houseGradeHistory ?? []).forEach((entry: HouseGradeHistoryEntry) => {
      if (entry.date === effectiveDate && entry.house) {
        map[entry.house.id] = entry.grade;
      }
    });
    return map;
  }, [historyData, effectiveDate]);

  const avgGradeByHouseId = useMemo(() => {
    const sums: Record<string, { total: number; count: number }> = {};
    (historyData?.houseGradeHistory ?? []).forEach((entry: HouseGradeHistoryEntry) => {
      if (!entry.house || !entry.grade) return;
      const bucket = sums[entry.house.id] ?? { total: 0, count: 0 };
      bucket.total += entry.grade;
      bucket.count += 1;
      sums[entry.house.id] = bucket;
    });

    const map: Record<string, number | undefined> = {};
    Object.entries(sums).forEach(([houseId, { total, count }]) => {
      map[houseId] = total / count;
    });
    return map;
  }, [historyData]);

  if (housesLoading || historyLoading)
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
        <Title noMargin>История домиков</Title>
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
        <HouseGradeHistoryTable
          houses={housesData?.houses ?? []}
          gradeByHouseId={gradeByHouseId}
          avgGradeByHouseId={avgGradeByHouseId}
        />
      </Section>
    </CenteredContainer>
  );
}
