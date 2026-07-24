import { User } from '@/app/types';

export function firstName(student: Pick<User, 'name'>): string {
  const source = student.name || '';
  return source.trim().split(/\s+/)[0] || '—';
}

export function buildPairName(students: Pick<User, 'name' | 'russianName'>[]): string {
  return students.map(firstName).join('-');
}

export function pairGroupNames(students: Pick<User, 'group'>[]): string {
  const names = Array.from(
    new Set(
      students.map((student) => student.group?.name).filter((name): name is string => !!name),
    ),
  );
  return names.join(' & ');
}
