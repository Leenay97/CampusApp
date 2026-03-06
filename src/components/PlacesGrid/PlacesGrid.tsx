import React, { useState } from 'react';
import { Group, Place } from '@/app/types';
import PlacesCell from './PlacesCell/PlacesCell';
import PlacesDropdown from './PlacesDropdown/PlacesDropdown';
import styles from './style.module.scss';
import SecondaryButton from '../SecondaryButton/SecondaryButton';

type Props = {
  groups: Group[];
  dates: Date[];
  places: (Place | undefined)[];
  grid: (Place | undefined)[][];
  onAutofill: () => void;
  setGrid: React.Dispatch<React.SetStateAction<(Place | undefined)[][]>>;
};

export default function TeamPlacesGrid({
  groups,
  dates,
  places,
  grid,
  onAutofill,
  setGrid,
}: Props) {
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);

  function handleSelect(row: number, col: number, place: Place) {
    setGrid((prev) => {
      const newGrid = prev.map((r) => [...r]);

      if (!newGrid[row]) newGrid[row] = [];

      newGrid[row][col] = place;

      return newGrid;
    });

    setEditingCell(null);
  }

  return (
    <div
      className={styles['places-grid']}
      style={{ '--dates-count': dates.length } as React.CSSProperties}
    >
      <SecondaryButton onClick={onAutofill}>Автозаполнение</SecondaryButton>

      {dates.map((date) => (
        <div key={date.toISOString()} className={styles['places-grid__header']}>
          {date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
        </div>
      ))}

      {groups.map((group, i) => (
        <React.Fragment key={group.id}>
          <div className={styles['places-grid__header']}>{group.name}</div>

          {dates.map((_, j) => {
            const place = grid[i]?.[j];

            return (
              <div key={group.id + j} className={styles['places-grid__cell-wrapper']}>
                <PlacesCell place={place} onClick={() => setEditingCell({ row: i, col: j })} />

                {editingCell?.row === i && editingCell?.col === j && (
                  <PlacesDropdown
                    places={places.filter((p) => p?.isTeamPlace)}
                    onSelect={(p) => handleSelect(i, j, p)}
                  />
                )}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}
