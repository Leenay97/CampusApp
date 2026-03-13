'use client';
import { Schedule } from '@/app/types';
import { useEffect, useState } from 'react';
import { DEFAULT_SCHEDULE } from './constants';
import styles from './ScheduleBuilder.module.scss';
import ScheduleBuilderRow from './ScheduleBuilderRow/ScheduleBuilderRow';
import Title from '../Title/Title';
import { InputField } from '../InputField/InputField';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import { useMutation, useQuery } from '@apollo/client';
import { UPDATE_SCHEDULE } from '@/graphql/mutations/UpdateSchedule';
import { GET_SCHEDULE } from '@/graphql/queries/GetSchedule';
import Section from '../Section/Section';

export default function ScheduleBuilder({ editMode }: { editMode?: boolean }) {
  const [schedules, setSchedules] = useState<Schedule[]>(DEFAULT_SCHEDULE.schedule);
  const [name, setName] = useState(DEFAULT_SCHEDULE.name);

  const [updateSchedule] = useMutation(UPDATE_SCHEDULE);
  const { data } = useQuery(GET_SCHEDULE);

  useEffect(() => {
    if (!data?.schedule) return;
    /*eslint-disable react-hooks/set-state-in-effect*/
    setName(data.schedule.dayName || '');

    try {
      const parsedSchedule = data.schedule.schedule ? JSON.parse(data.schedule.schedule) : [];
      setSchedules(parsedSchedule);
    } catch (err) {
      console.error('Failed to parse schedule:', err);
      setSchedules([]);
    }
  }, [data?.schedule]);

  function handleScheduleChange(index: number, updated: Partial<Schedule>) {
    setSchedules((prev) =>
      prev.map((schedule, i) => (i === index ? { ...schedule, ...updated } : schedule)),
    );
  }

  function handleDeleteRow(index: number) {
    setSchedules((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAddRow(index: number) {
    setSchedules((prev) => {
      const updated = [...prev];

      updated.splice(index + 1, 0, {
        time: '',
        activity: '',
      });

      return updated;
    });
  }

  function handleSave() {
    const schedulesJSON = JSON.stringify(schedules);
    try {
      updateSchedule({ variables: { dayName: name, schedule: schedulesJSON } });
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className={styles['schedule-builder']}>
      <Section>
        {editMode && <PrimaryButton onClick={handleSave}>Сохранить</PrimaryButton>}
        {editMode ? <InputField value={name} onChange={setName} /> : <Title>{name}</Title>}
      </Section>

      {schedules.map((schedule, index) => (
        <ScheduleBuilderRow
          key={index}
          schedule={schedule}
          onChange={(data) => handleScheduleChange(index, data)}
          onAdd={() => handleAddRow(index)}
          onDelete={() => handleDeleteRow(index)}
          editMode={editMode}
        />
      ))}
    </div>
  );
}
