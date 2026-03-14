'use client';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import { InputField } from '@/components/InputField/InputField';
import Loader from '@/components/Loader/Loaader';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import Section from '@/components/Section/Section';
import Subtitle from '@/components/Subtitle/Subtitle';
import Title from '@/components/Title/Title';
import { UPDATE_TECHNICAL_DATA } from '@/graphql/mutations/UpdateTechnicalData';
import { GET_TECHICAL_DATA } from '@/graphql/queries/GetTechnicalData';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { useQuery } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';

export default function TechnicalData() {
  const { data, loading, refetch } = useQuery(GET_TECHICAL_DATA);
  const [updateData] = useGlobalLoadingMutation(UPDATE_TECHNICAL_DATA);

  const [workshopValue, setWorkshopValue] = useState<string>('');
  const [sportValue, setSportValue] = useState<string>('');
  const [workshopStart, setWorkshopStart] = useState<string>('');
  const [sportTimeStart, setSportTimeStart] = useState<string>('');

  const technicalData = useMemo(() => data?.technicalData, [data?.technicalData]);

  useEffect(() => {
    if (data) {
      /*eslint-disable react-hooks/set-state-in-effect*/
      setWorkshopValue(technicalData?.workshopValue?.toString() || '');
      setSportValue(technicalData?.sportTimeValue?.toString() || '');
      setWorkshopStart(technicalData?.workshopStart || '');
      setSportTimeStart(technicalData?.sportTimeStart || '');
    }
  }, [
    data,
    technicalData?.sportTimeStart,
    technicalData?.sportTimeValue,
    technicalData?.workshopStart,
    technicalData?.workshopValue,
  ]);

  async function handleSave() {
    try {
      await updateData({
        workshopValue: Number(workshopValue),
        sportTimeValue: Number(sportValue),
        workshopStart: workshopStart.length ? workshopStart : null,
        sportTimeStart: sportTimeStart.length ? sportTimeStart : null,
      });
      refetch();
    } catch (err) {
      console.log(err);
    }
  }

  if (loading)
    return (
      <CenteredContainer>
        <Section>
          <Loader />
        </Section>
      </CenteredContainer>
    );

  return (
    <CenteredContainer noPadding>
      <Section>
        <Title>Тех. данные</Title>
        <div>
          <Subtitle>Coins за воркшоп</Subtitle>
          <InputField
            width="80px"
            maxLength={3}
            value={workshopValue}
            onChange={setWorkshopValue}
          />
        </div>
        <div>
          <Subtitle>Coins за Sport Time</Subtitle>
          <InputField width="80px" maxLength={3} value={sportValue} onChange={setSportValue} />
        </div>
        <div>
          <Subtitle>Начало записи на мастеркласс</Subtitle>
          <InputField width="120px" type="time" value={workshopStart} onChange={setWorkshopStart} />
        </div>
        <div>
          <Subtitle>Начало записи на Sport Time</Subtitle>
          <InputField
            width="120px"
            type="time"
            value={sportTimeStart}
            onChange={setSportTimeStart}
          />
        </div>
        <PrimaryButton onClick={handleSave}>Сохранить</PrimaryButton>
      </Section>
    </CenteredContainer>
  );
}
