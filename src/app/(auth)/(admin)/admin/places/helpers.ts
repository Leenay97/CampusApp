export function generateColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 80%)`;
}

import { Group, Place } from '@/app/types';

export function generateTeamPlacesGrid(
  groups: Group[],
  places: Place[],
  datesCount: number,
): Place[][] {
  const teamPlaces = places.filter((p) => p.isTeamPlace);

  if (!teamPlaces.length) return [];

  const totalPlaces = teamPlaces.length;

  const grid: Place[][] = [];

  groups.forEach((_, i) => {
    const row: Place[] = [];

    for (let j = 0; j < datesCount; j++) {
      const index = (i + j) % totalPlaces;
      row.push(teamPlaces[index]);
    }

    grid.push(row);
  });

  return grid;
}

type GroupPlacesPayload = {
  groupId: string;
  places: string;
};

export function buildPlacesPayload(
  groups: Group[],
  dates: Date[],
  grid: (Place | undefined)[][],
): GroupPlacesPayload[] {
  return groups.map((group, rowIndex) => {
    const places = dates
      .map((date, colIndex) => {
        const place = grid[rowIndex]?.[colIndex];
        if (!place) return null;

        return {
          date: date.getTime(),
          placeId: place.id,
        };
      })
      .filter(Boolean);

    return {
      groupId: group.id,
      places: JSON.stringify(places),
    };
  });
}

export function buildGridFromGroups(
  groups: Group[],
  dates: Date[],
  places: Place[],
): (Place | undefined)[][] {
  const placesMap = Object.fromEntries(places.map((p) => [p.id, p]));

  return groups.map((group) => {
    const groupPlaces: { date: number; placeId: string }[] = JSON.parse(group.places || '[]');

    return dates.map((date) => {
      const match = groupPlaces.find((p) => p.date === date.getTime());
      return match ? placesMap[match.placeId] : undefined;
    });
  });
}
