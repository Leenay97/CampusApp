'use client';

import { User } from '@/app/types';
import styles from './styles.module.scss';

import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import { CustomSelect } from '@/components/CustomSelect/CustomSelect';
import { InputField } from '@/components/InputField/InputField';
import Section from '@/components/Section/Section';
import StudentsTable from '@/components/StudentsTable/StudentsTable';
import Title from '@/components/Title/Title';
import { GET_ACTIVE_SEASON } from '@/graphql/queries/GetActiveSeason';
import { GET_SEASON_STUDENTS } from '@/graphql/queries/GetSeasonStudents';
import { useQuery } from '@apollo/client';
import { useMemo, useState } from 'react';

export default function StudentsPage() {
  const [name, setName] = useState('');
  const [group, setGroup] = useState({ id: '', name: '' });
  const { data: groupsData, loading: groupsLoading } = useQuery(GET_ACTIVE_SEASON);
  const { data: studentsData, loading: studentsLoading } = useQuery(GET_SEASON_STUDENTS);

  const filteredStudents: User[] = useMemo(() => {
    if (!studentsData?.seasonStudents) return [];

    let filtered = [...studentsData.seasonStudents];

    if (name.trim()) {
      filtered = filtered.filter(
        (student) =>
          student.name?.toLowerCase().includes(name.toLowerCase()) ||
          student.russianName?.toLowerCase().includes(name.toLowerCase()),
      );
    }

    if (group?.id) {
      filtered = filtered.filter((student) => student.group?.id === group.id);
    }

    return filtered;
  }, [studentsData, name, group]);

  return (
    <CenteredContainer wide noPadding>
      <Section>
        <Title>Студенты</Title>
        <div className={styles['row']}>
          <InputField value={name} onChange={setName} width="240px" placeholder="Имя" />
          <CustomSelect
            items={groupsData?.activeSeason.groups}
            onChange={setGroup}
            initValue={group.name}
            hasCleanButton
          />
        </div>
        <StudentsTable students={filteredStudents} />
      </Section>
    </CenteredContainer>
  );
}
