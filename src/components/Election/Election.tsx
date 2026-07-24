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
  userGroupId?: string | null;
  onVote?: (optionId: string) => void;
  onStart?: () => void;
  onFinish?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
};
export default function Election({
  election,
  adminMode = false,
  userGroupId = null,
  onVote,
  onStart,
  onFinish,
  onDelete,
  onEdit,
}: Props) {
  const isFinished = election.status === 'FINISHED';
  const showResults = adminMode || isFinished;

  const sortedOptions = useMemo(() => {
    if (showResults) {
      return [...election.options].sort((a, b) => b.votesNumber - a.votesNumber);
    }
    return [...election.options].sort((a, b) => a.name.localeCompare(b.name));
  }, [election.options, showResults]);

  return (
    <CenteredContainer noPadding>
      <Section className={styles['election__section']}>
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
              finished={isFinished}
              isOwnGroup={!adminMode && Boolean(userGroupId) && item.groupId === userGroupId}
              onClick={onVote ? () => onVote(item.id) : undefined}
            />
          ))}
        </div>
        {adminMode && (
          <div className={styles['controls']}>
            {election.status === 'DRAFT' && onEdit && (
              <SecondaryButton onClick={onEdit}>Редактировать</SecondaryButton>
            )}
            {election.status === 'DRAFT' && onStart && (
              <SecondaryButton onClick={onStart}>Запустить</SecondaryButton>
            )}
            {election.status === 'FINISHED' && onStart && (
              <SecondaryButton onClick={onStart}>Возобновить</SecondaryButton>
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
