'use client';
import { MazeRunnerResult } from '@/app/types';
import styles from './MazeRunnerResultsTable.module.scss';

type MazeRunnerResultsTableProps = {
  results: MazeRunnerResult[];
};

// Время разгадки — момент отправки верного кода: старт ивента нигде не
// хранится, поэтому длительность посчитать не из чего.
function formatSolvedAt(solvedAt: string | null) {
  if (!solvedAt) return '—';
  return new Date(Number(solvedAt)).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function MazeRunnerResultsTable({ results }: MazeRunnerResultsTableProps) {
  if (results.length === 0) {
    return <div className={styles['empty']}>Нет групп в активном сезоне</div>;
  }

  return (
    <div className={styles['results']}>
      <div className={`${styles['results__cell']} ${styles['results__cell--header']}`}>#</div>
      <div
        className={`${styles['results__cell']} ${styles['results__cell--header']} ${styles['results__cell--group']}`}
      >
        Группа
      </div>
      <div className={`${styles['results__cell']} ${styles['results__cell--header']}`}>Время</div>

      {results.map((result, index) => (
        <div key={result.groupId} className={styles['results__row']}>
          <div className={styles['results__cell']}>{result.isSolved ? index + 1 : '—'}</div>
          <div className={`${styles['results__cell']} ${styles['results__cell--group']}`}>
            {result.groupName}
          </div>
          <div
            className={`${styles['results__cell']} ${
              result.isSolved ? '' : styles['results__cell--unsolved']
            }`}
          >
            {result.isSolved ? formatSolvedAt(result.solvedAt) : 'не разгадали'}
          </div>
        </div>
      ))}
    </div>
  );
}
