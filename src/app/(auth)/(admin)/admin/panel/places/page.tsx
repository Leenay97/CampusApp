'use client';

import { useQuery } from '@apollo/client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { GET_ACTIVE_SEASON } from '@/graphql/queries/GetActiveSeason';
import { GET_PLACES } from '@/graphql/queries/GetPlaces';
import { CREATE_PLACE } from '@/graphql/mutations/CreatePlace';
import PlacesGrid from '@components/PlacesGrid/PlacesGrid';
import AddPlaceForm from '@components/AddPlaceForm/AddPlaceForm';
import { Place } from '@/app/types';
import { buildGridFromGroups, generateTeamPlacesGrid } from './helpers';
import { List } from '@/components/List/List';
import { MultipleSelect } from '@/components/MultipleSelect/MultipleSelect';
import { buildPlacesPayload } from './helpers';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@/components/SecondaryButton/SecondaryButton';
import html2canvas from 'html2canvas';
import styles from './PlacesPage.module.scss';
import Section from '@/components/Section/Section';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Title from '@/components/Title/Title';
import Subtitle from '@/components/Subtitle/Subtitle';
import Loader from '@/components/Loader/Loaader';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { UPDATE_GROUP } from '@/graphql/mutations/UpdateGroup';

export default function PlacesPage() {
  const { data, loading } = useQuery(GET_ACTIVE_SEASON);
  const { data: placesData, loading: placesLoading, refetch } = useQuery(GET_PLACES);
  const [updateGroup] = useGlobalLoadingMutation(UPDATE_GROUP);
  const [createPlace] = useGlobalLoadingMutation(CREATE_PLACE);

  const [grid, setGrid] = useState<(Place | undefined)[][]>([]);
  const [color, setColor] = useState<string>('');
  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>([]);

  const gridRef = useRef<HTMLDivElement>(null);

  const dates = useMemo(() => {
    if (!data?.activeSeason) return [];

    const start = new Date(Number(data?.activeSeason.startDate));
    const end = new Date(Number(data?.activeSeason.endDate));

    const arr: Date[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      arr.push(new Date(d));
    }

    return arr;
  }, [data?.activeSeason]);

  const groups = useMemo(() => data?.activeSeason?.groups ?? [], [data?.activeSeason]);

  const places: Place[] = useMemo(() => {
    return placesData?.places ?? [];
  }, [placesData?.places]);

  const teamPlaces = useMemo(() => {
    return places.filter((place) => place.isTeamPlace);
  }, [places]);

  function handleAutoFill() {
    const newGrid = generateTeamPlacesGrid(
      groups,
      selectedPlaces.length > 0 ? selectedPlaces : places,
      dates.length,
    );

    setGrid(newGrid);
  }

  useEffect(() => {
    if (!places.length || !groups.length) return;
    const initialGrid = buildGridFromGroups(groups, dates, places);
    /*eslint-disable react-hooks/set-state-in-effect*/
    setGrid(initialGrid);
  }, [places, groups, dates]);

  async function handleSave() {
    if (!grid) return;
    const payload = buildPlacesPayload(groups, dates, grid);

    try {
      for (const item of payload) {
        await updateGroup({
          id: item.groupId,
          amount: 0,
          places: item.places,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDownloadPNG() {
    if (!gridRef.current) return;
    const canvas = await html2canvas(gridRef.current, { backgroundColor: '#fff', scale: 2 });
    const dataURL = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'schedule.png';
    link.click();
  }

  async function handleCreate(name: string, isTeam: boolean) {
    try {
      await createPlace({ name, isTeamPlace: isTeam, color });
      refetch();
    } catch (error) {
      console.error(error);
    }
  }

  if (placesLoading || loading)
    return (
      <CenteredContainer>
        <Section>
          <Loader />
        </Section>
      </CenteredContainer>
    );

  return (
    <CenteredContainer wide noPadding>
      <Section>
        <div ref={gridRef}>
          <Title>Расписание групповых мест</Title>
          <PlacesGrid
            groups={groups}
            dates={dates}
            places={selectedPlaces.length ? selectedPlaces : places}
            grid={grid}
            setGrid={setGrid}
            onAutofill={handleAutoFill}
          />
        </div>
        <div>
          <Subtitle>Выбрать места для заполнения (иначе будут использованы все)</Subtitle>
          <MultipleSelect<Place>
            items={teamPlaces}
            value={selectedPlaces}
            onChange={setSelectedPlaces}
          />
        </div>
        <div className={styles['places-buttons']}>
          <PrimaryButton width="500px" onClick={handleSave}>
            Сохранить
          </PrimaryButton>
          <SecondaryButton onClick={handleDownloadPNG}>Скачать PNG</SecondaryButton>
        </div>
      </Section>
      <Section>
        <AddPlaceForm onCreate={handleCreate} color={color} changeColor={setColor} />
        <List title={'Все места'} items={places} isLoading={loading} />
      </Section>
    </CenteredContainer>
  );
}
