'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import styles from './styles.module.scss';

import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import { CustomSelect } from '@/components/CustomSelect/CustomSelect';
import { InputField } from '@/components/InputField/InputField';
import Loader from '@/components/Loader/Loaader';
import Modal from '@/components/Modal/Modal';
import ModalBody from '@/components/Modal/ModalBody';
import ModalHeader from '@/components/Modal/ModalHeader';
import Section from '@/components/Section/Section';
import Subtitle from '@/components/Subtitle/Subtitle';
import Title from '@/components/Title/Title';
import { GET_ARCHIVED_SEASONS } from '@/graphql/queries/GetArchivedSeasons';
import { GET_ARCHIVED_SEASON } from '@/graphql/queries/GetArchivedSeason';
import DesktopOnly from '@/components/DesktopOnly/DesktopOnly';

type ArchivedPerson = {
  id: string;
  name: string;
  russianName?: string;
  photoUrl?: string;
};

type ArchivedGroup = {
  id: string;
  name: string;
  teachers: ArchivedPerson[];
  students: ArchivedPerson[];
};

type ArchivedWorkshop = {
  id: string;
  name: string;
  date?: string;
  teacher?: string;
};

type ArchivedLessonCount = {
  name: string;
  count: number;
};

type ArchivedSeason = {
  id: string;
  number: string;
  year: string;
  groups: ArchivedGroup[];
  workshops: ArchivedWorkshop[];
  sporttimes: ArchivedWorkshop[];
  lessonCounts: ArchivedLessonCount[];
};

type StudentRow = {
  id: string;
  name: string;
  russianName?: string;
  photoUrl?: string;
  group: string;
};

type SortDirection = 'asc' | 'desc';

function formatDate(raw?: string | null): string {
  if (!raw) return '—';
  const timestamp = parseInt(raw, 10);
  const date = isNaN(timestamp) ? new Date(raw) : new Date(timestamp);
  return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('ru-RU');
}

function compareStrings(a?: string | null, b?: string | null): number {
  return (a ?? '').localeCompare(b ?? '', 'ru');
}

function useSort<K extends string>(initialKey: K) {
  const [sortKey, setSortKey] = useState<K>(initialKey);
  const [direction, setDirection] = useState<SortDirection>('asc');

  function handleSort(key: K) {
    if (key === sortKey) {
      setDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setDirection('asc');
    }
  }

  function arrow(key: K): string {
    if (key !== sortKey) return '';
    return direction === 'asc' ? ' ↑' : ' ↓';
  }

  return { sortKey, direction, handleSort, arrow };
}

function WorkshopsTable({ workshops }: { workshops: ArchivedWorkshop[] }) {
  const { sortKey, direction, handleSort, arrow } = useSort<'name' | 'date' | 'teacher'>('date');

  if (!workshops.length) return <p className={styles['empty']}>Ничего не найдено</p>;

  const sorted = [...workshops].sort((a, b) => {
    const result =
      sortKey === 'date'
        ? (parseInt(a.date ?? '0', 10) || 0) - (parseInt(b.date ?? '0', 10) || 0)
        : compareStrings(a[sortKey], b[sortKey]);
    return direction === 'asc' ? result : -result;
  });

  return (
    <table className={styles['table']}>
      <thead>
        <tr>
          <th className={styles['sortable']} onClick={() => handleSort('name')}>
            Название{arrow('name')}
          </th>
          <th className={styles['sortable']} onClick={() => handleSort('date')}>
            Дата{arrow('date')}
          </th>
          <th className={styles['sortable']} onClick={() => handleSort('teacher')}>
            Учитель{arrow('teacher')}
          </th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((workshop) => (
          <tr key={workshop.id}>
            <td>{workshop.name}</td>
            <td>{formatDate(workshop.date)}</td>
            <td>{workshop.teacher ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function LessonCountsTable({ lessonCounts }: { lessonCounts: ArchivedLessonCount[] }) {
  const { direction, handleSort, arrow, sortKey } = useSort<'name' | 'count'>('name');

  if (!lessonCounts.length) return <p className={styles['empty']}>Ничего не найдено</p>;

  const sorted = [...lessonCounts].sort((a, b) => {
    const result = sortKey === 'count' ? a.count - b.count : compareStrings(a.name, b.name);
    return direction === 'asc' ? result : -result;
  });

  return (
    <table className={styles['table']}>
      <thead>
        <tr>
          <th className={styles['sortable']} onClick={() => handleSort('name')}>
            Учитель{arrow('name')}
          </th>
          <th className={styles['sortable']} onClick={() => handleSort('count')}>
            Проведено уроков{arrow('count')}
          </th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((row) => (
          <tr key={row.name}>
            <td>{row.name}</td>
            <td>{row.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StudentsTable({ rows }: { rows: StudentRow[] }) {
  const { sortKey, direction, handleSort, arrow } = useSort<'name' | 'russianName' | 'group'>(
    'name',
  );
  const [enlarged, setEnlarged] = useState<StudentRow | null>(null);

  if (!rows.length) return <p className={styles['empty']}>Студентов не найдено</p>;

  const sorted = [...rows].sort((a, b) => {
    const result = compareStrings(a[sortKey], b[sortKey]);
    return direction === 'asc' ? result : -result;
  });

  return (
    <>
      {enlarged && (
        <Modal onClose={() => setEnlarged(null)}>
          <ModalHeader
            title={enlarged.name || enlarged.russianName || ''}
            onClose={() => setEnlarged(null)}
          />
          <ModalBody>
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${enlarged.photoUrl}`}
              alt={enlarged.name}
              className={styles['avatar-full']}
            />
          </ModalBody>
        </Modal>
      )}
      <table className={styles['table']}>
        <thead>
          <tr>
            <th className={styles['sortable']} onClick={() => handleSort('name')}>
              Имя{arrow('name')}
            </th>
            <th className={styles['sortable']} onClick={() => handleSort('russianName')}>
              Русское имя{arrow('russianName')}
            </th>
            <th className={styles['sortable']} onClick={() => handleSort('group')}>
              Группа{arrow('group')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((student) => (
            <tr key={student.id}>
              <td>
                <div className={styles['name-cell']}>
                  <div
                    className={`${styles['avatar']} ${
                      student.photoUrl ? styles['avatar--clickable'] : ''
                    }`}
                    style={
                      student.photoUrl
                        ? {
                            backgroundImage: `url(${process.env.NEXT_PUBLIC_API_URL}${student.photoUrl})`,
                          }
                        : undefined
                    }
                    onClick={() => student.photoUrl && setEnlarged(student)}
                  >
                    {!student.photoUrl && (student.name?.[0]?.toUpperCase() ?? '')}
                  </div>
                  {student.name || '—'}
                </div>
              </td>
              <td>{student.russianName || '—'}</td>
              <td>{student.group}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default function SeasonArchivePage() {
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');
  const [teacher, setTeacher] = useState<string>('');
  const [group, setGroup] = useState({ id: '', name: '' });
  const [studentSearch, setStudentSearch] = useState<string>('');

  const { data: seasonsData, loading: seasonsLoading } = useQuery(GET_ARCHIVED_SEASONS);
  const { data: seasonData, loading: seasonLoading } = useQuery(GET_ARCHIVED_SEASON, {
    variables: { id: selectedSeasonId },
    skip: !selectedSeasonId,
  });

  const seasonItems = useMemo(() => {
    const seasons: { id: string; number: string; year: string }[] =
      seasonsData?.archivedSeasons ?? [];
    return seasons.map((season) => ({
      id: season.id,
      name: `Сезон ${season.number} — ${season.year}`,
    }));
  }, [seasonsData]);

  const season: ArchivedSeason | undefined = seasonData?.archivedSeason;

  const teacherItems = useMemo(() => {
    if (!season) return [];
    const names = new Set(
      [...season.workshops, ...season.sporttimes]
        .map((workshop) => workshop.teacher)
        .filter((name): name is string => Boolean(name)),
    );
    return [...names].sort((a, b) => compareStrings(a, b)).map((name) => ({ id: name, name }));
  }, [season]);

  const filteredWorkshops = (season?.workshops ?? []).filter(
    (workshop) => !teacher || workshop.teacher === teacher,
  );
  const filteredSporttimes = (season?.sporttimes ?? []).filter(
    (workshop) => !teacher || workshop.teacher === teacher,
  );

  const studentRows: StudentRow[] = useMemo(() => {
    if (!season) return [];
    const search = studentSearch.trim().toLowerCase();

    return season.groups
      .filter((g) => !group.id || g.id === group.id)
      .flatMap((g) =>
        g.students
          .filter(
            (student) =>
              !search ||
              student.name?.toLowerCase().includes(search) ||
              student.russianName?.toLowerCase().includes(search),
          )
          .map((student) => ({
            id: `${g.id}-${student.id}`,
            name: student.name,
            russianName: student.russianName,
            photoUrl: student.photoUrl,
            group: g.name,
          })),
      );
  }, [season, group.id, studentSearch]);

  function handleChangeSeason(item: { id: string; name: string }) {
    setSelectedSeasonId(item.id);
    setTeacher('');
    setGroup({ id: '', name: '' });
    setStudentSearch('');
  }

  if (seasonsLoading) {
    return (
      <CenteredContainer>
        <Section>
          <Loader />
        </Section>
      </CenteredContainer>
    );
  }

  return (
    <CenteredContainer wide noPadding>
      <Section>
        <DesktopOnly>
          <div className={styles['wrapper']}>
            <Title noMargin>Архив сезонов</Title>
            {!seasonItems.length && <p className={styles['empty']}>Архивных сезонов пока нет</p>}
            <CustomSelect
              items={seasonItems}
              placeholder="Выберите сезон"
              onChange={handleChangeSeason}
            />

            {seasonLoading && <Loader />}

            {season && !seasonLoading && (
              <>
                <div>
                  <Subtitle>Мастерклассы</Subtitle>
                  <CustomSelect
                    items={teacherItems}
                    initValue={teacher}
                    placeholder="Все учителя"
                    onChange={(item) => setTeacher(item.id)}
                    hasCleanButton
                  />
                </div>
                <WorkshopsTable workshops={filteredWorkshops} />

                <Subtitle>Sport Time</Subtitle>
                <WorkshopsTable workshops={filteredSporttimes} />

                <Subtitle>Уроки английского</Subtitle>
                <LessonCountsTable lessonCounts={season.lessonCounts ?? []} />

                <div>
                  <Subtitle>Студенты</Subtitle>
                  <div className={styles['row']}>
                    <InputField
                      value={studentSearch}
                      onChange={setStudentSearch}
                      width="240px"
                      placeholder="Поиск по имени"
                    />
                    <CustomSelect
                      items={season.groups}
                      initValue={group.name}
                      placeholder="Все группы"
                      onChange={setGroup}
                      hasCleanButton
                    />
                  </div>
                </div>
                <StudentsTable rows={studentRows} />
              </>
            )}
          </div>
        </DesktopOnly>
      </Section>
    </CenteredContainer>
  );
}
