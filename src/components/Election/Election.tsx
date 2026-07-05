import { Vote, VoteStatus } from '@/app/types';
import Section from '../Section/Section';
import CenteredContainer from '../CenteredContainer/CenteredContainer';
import Subtitle from '../Subtitle/Subtitle';
import SecondaryButton from '../SecondaryButton/SecondaryButton';
import ElectionItem from './ElectionItem';
import styles from './Election.module.scss';
import { useMemo } from 'react';

const STATUS_LABELS: Record<VoteStatus, string> = {
  DRAFT: 'Черновик',
  ACTIVE: 'Идёт голосование',
  FINISHED: 'Завершено',
};

type Props = {
  election: Vote;
  adminMode?: boolean;
  onVote?: (optionId: string) => void;
  onStart?: () => void;
  onFinish?: () => void;
  onDelete?: () => void;
};
export default function Election({
  election,
  adminMode = false,
  onVote,
  onStart,
  onFinish,
  onDelete,
}: Props) {
  const isFinished = election.status === 'FINISHED';
  const showResults = adminMode || isFinished;

  const sortedOptions = useMemo(() => {
    return [...election.options].sort((a, b) => a.name.localeCompare(b.name));
  }, [election.options]);

  return (
    <CenteredContainer noPadding>
      <Section>
        <Subtitle>{election.title}</Subtitle>
        {adminMode && <div className={styles['status']}>{STATUS_LABELS[election.status]}</div>}
        {!adminMode && isFinished && (
          <div className={styles['status']}>Голосование завершено — итоги</div>
        )}
        <div className={styles['election']}>
          {sortedOptions.map((item) => (
            <ElectionItem
              key={item.id}
              option={item}
              showCount={showResults}
              adminMode={adminMode}
              voted={item.id === election.votedOptionId}
              disabled={adminMode || election.status !== 'ACTIVE'}
              onClick={onVote ? () => onVote(item.id) : undefined}
            />
          ))}
        </div>
        {adminMode && (
          <div className={styles['controls']}>
            {election.status === 'DRAFT' && onStart && (
              <SecondaryButton onClick={onStart}>Запустить</SecondaryButton>
            )}
            {election.status === 'ACTIVE' && onFinish && (
              <SecondaryButton onClick={onFinish}>Завершить</SecondaryButton>
            )}
            {onDelete && <SecondaryButton onClick={onDelete}>Удалить</SecondaryButton>}
          </div>
        )}
      </Section>
    </CenteredContainer>
  );
}
