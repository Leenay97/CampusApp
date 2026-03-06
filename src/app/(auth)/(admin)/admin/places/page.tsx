'use client';

import { useMutation, useQuery } from '@apollo/client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { GET_ACTIVE_SEASON } from '@/graphql/queries/GetActiveSeason';
import { GET_PLACES } from '@/graphql/queries/GetPlaces';
import { CREATE_PLACE } from '@/graphql/mutations/CreatePlace';
import PlacesGrid from '@components/PlacesGrid/PlacesGrid';
import AddPlaceForm from '@components/AddPlaceForm/AddPlaceForm';
import { LoadingType, Place } from '@/app/types';
import { buildGridFromGroups, generateTeamPlacesGrid } from './helpers';
import { List } from '@/components/List/List';
import { MultipleSelect } from '@/components/MultipleSelect/MultipleSelect';
import { buildPlacesPayload } from './helpers';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import mutations from '@/graphql/mutations';
import SecondaryButton from '@/components/SecondaryButton/SecondaryButton';
import html2canvas from 'html2canvas';
import styles from './style.module.scss';
import ModalLoading from '@/components/ModalLoading/ModalLoading';

export default function PlacesPage() {
  const { data } = useQuery(GET_ACTIVE_SEASON);
  const { data: placesData, loading, refetch } = useQuery(GET_PLACES);
  const [updateGroup] = useMutation(mutations.UPDATE_GROUP);
  const [createPlace] = useMutation(CREATE_PLACE);

  const [grid, setGrid] = useState<(Place | undefined)[][]>([]);
  const [color, setColor] = useState<string>('');
  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>([]);
  const [someLoading, setSomeLoading] = useState<LoadingType>('NONE');

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

  const groups = data?.activeSeason?.groups ?? [];
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
    setSomeLoading('LOADING');

    try {
      for (const item of payload) {
        await updateGroup({
          variables: {
            id: item.groupId,
            amount: 0,
            places: item.places,
          },
        });
      }
      setSomeLoading('SUCCESS');
    } catch (err) {
      console.log(err);
      setSomeLoading('ERROR');
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
    setSomeLoading('LOADING');
    try {
      await createPlace({
        variables: { name, isTeamPlace: isTeam, color },
      });
      setSomeLoading('SUCCESS');
      refetch();
    } catch (err) {
      console.log(err);
      setSomeLoading('ERROR');
    }
  }

  return (
    <div className="centered-container wide flex-container">
      <div className="section">
        <div ref={gridRef}>
          <h1 className="title">Расписание групповых мест</h1>
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
          <h2 className="subtitle">Выбрать места для заполнения (иначе будут использованы все)</h2>
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
      </div>
      <div className="section">
        <AddPlaceForm onCreate={handleCreate} color={color} changeColor={setColor} />
        <List items={places} isLoading={loading} />
      </div>
      {someLoading !== 'NONE' && (
        <ModalLoading onClose={() => setSomeLoading('NONE')} loadingState={someLoading} />
      )}
    </div>
  );
}
