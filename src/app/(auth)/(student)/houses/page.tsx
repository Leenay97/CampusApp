'use client';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import Section from '@/components/Section/Section';
import Title from '@/components/Title/Title';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import mapImage from '@/assets/img/map.jpg';
import styles from './Houses.module.scss';
import Subtitle from '@/components/Subtitle/Subtitle';
import { InputField } from '@/components/InputField/InputField';
import House from '@/components/House/House';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { CREATE_HOUSE } from '@/graphql/mutations/CreateHouse';
import { useQuery } from '@apollo/client';
import { GET_HOUSES } from '@/graphql/queries/GetHouses';
import Filters from '@/components/Filters/Filters';
import { useUser } from '@/contexts/UserContext';
import Loader from '@/components/Loader/Loaader';

type SortOption = 'по номеру' | 'по оценке';

export default function HousesPage() {
  const [showMap, setShowMap] = useState<boolean>(false);
  const [creationNumber, setCreationNumber] = useState('');
  const [createHouse] = useGlobalLoadingMutation(CREATE_HOUSE);
  const { data, loading, refetch } = useQuery(GET_HOUSES);
  const [sortBy, setSortBy] = useState<SortOption>('по номеру');
  const { user } = useUser();

  async function handleCreate() {
    try {
      await createHouse({ number: creationNumber });
      setCreationNumber('');
      refetch();
    } catch (err) {
      console.error(err);
    }
  }

  function handleChangeNumber(value: string) {
    setCreationNumber(value);
  }

  const sortedHouses = useMemo(() => {
    if (!data?.houses) return [];

    const houses = [...data?.houses];

    if (sortBy === 'по номеру') {
      return houses.sort((a, b) => Number(a.number) - Number(b.number));
    } else {
      return houses.sort((a, b) => {
        if (!a.grade && !b.grade) return 0;
        if (!a.grade) return 1;
        if (!b.grade) return -1;
        return b.grade - a.grade;
      });
    }
  }, [data?.houses, sortBy]);

  const filterOptions: SortOption[] = ['по номеру', 'по оценке'];

  if (loading)
    return (
      <CenteredContainer>
        <Section>
          <Loader />
        </Section>
      </CenteredContainer>
    );

  return (
    <CenteredContainer>
      <Section>
        <Title>Houses</Title>
        <PrimaryButton onClick={() => setShowMap((prev) => !prev)}>
          {showMap ? 'Скрыть карту' : 'Показать карту'}
        </PrimaryButton>

        {showMap && (
          <div className={styles['map-wrapper']}>
            <Image
              className={styles['houses__map']}
              src={mapImage}
              alt="map"
              priority
              sizes="100vw"
              quality={75}
              loading="eager"
            />
          </div>
        )}
        {user?.userLevel === 'ADMIN' && (
          <>
            <Subtitle noMargin>Добавить домик</Subtitle>
            <div className={styles['houses__add']}>
              <Subtitle noMargin>№</Subtitle>
              <InputField
                value={creationNumber}
                onChange={handleChangeNumber}
                width="60px"
                maxLength={3}
              />
              <PrimaryButton onClick={handleCreate}>Добавить</PrimaryButton>
            </div>
          </>
        )}
      </Section>

      <Section>
        <div className={styles['houses__filters']}>
          <Subtitle>Сортировать:</Subtitle>
          <Filters
            options={filterOptions}
            value={sortBy}
            onChange={(value) => setSortBy(value as SortOption)}
          />
        </div>

        <div className={styles['houses__container']}>
          {sortedHouses.map((house) => (
            <House
              key={house.id}
              id={house.id}
              number={house.number}
              grade={house.grade}
              refetchHouses={refetch}
            />
          ))}
        </div>
      </Section>
    </CenteredContainer>
  );
}
