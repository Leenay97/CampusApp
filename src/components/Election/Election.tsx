import { Vote } from '@/app/types';
import Section from '../Section/Section';
import CenteredContainer from '../CenteredContainer/CenteredContainer';
import Subtitle from '../Subtitle/Subtitle';
import ElectionItem from './ElectionItem';
import styles from './Election.module.scss';
import { useMemo } from 'react';

type Props = {
  election: Vote;
  adminMode?: boolean;
  onVote?: (optionId: string) => void;
};
export default function Election({ election, adminMode = false, onVote }: Props) {
  const sortedOptions = useMemo(() => {
    return [...election.options].sort((a, b) => a.name.localeCompare(b.name));
  }, [election.options]);

  return (
    <CenteredContainer noPadding>
      <Section>
        <Subtitle>{election.title}</Subtitle>
        <div className={styles['election']}>
          {sortedOptions.map((item) => (
            <ElectionItem
              key={item.id}
              option={item}
              adminMode={adminMode}
              voted={item.id === election.votedOptionId}
              disabled={adminMode}
              onClick={onVote ? () => onVote(item.id) : undefined}
            />
          ))}
        </div>
      </Section>
    </CenteredContainer>
  );
}
