import { User } from '@/app/types';

export function firstName(student: Pick<User, 'name'>): string {
  const source = student.name || '';
  return source.trim().split(/\s+/)[0] || '—';
}

export function buildPairName(students: Pick<User, 'name' | 'russianName'>[]): string {
  return students.map(firstName).join('-');
}
