import { memo } from 'react';
import styles from './style.module.scss';

type TeamProps = {
  team: Team;
  place?: number;
  changedPoints?: number;
  hidden: boolean;
};

function Team({ team, place, changedPoints, hidden }: TeamProps) {
  const originalPoints = team.points - (changedPoints ?? 0);

  const emojiSets = [
    '🌸🌼🌸🌼🌸🌼🌸',
    '🐣🌟🐣🌟🐣🌟🐣',
    '🍭🍬🍭🍬🍭🍬🍭',
    '🦄🌈🦄🌈🦄🌈🦄',
    '🐱🎋🐱🎋🐱🎋🐱',
    '🍪🍫🍪🍫🍪🍫🍪',
    '🐰🥕🐰🥕🐰🥕🐰',
    '🐻🍯🐻🍯🐻🍯🐻',
    '🐸🍀🐸🍀🐸🍀🐸',
    '🐝🍯🐝🍯🐝🍯🐝',
    '🐙⭐🐙⭐🐙⭐🐙',
    '🦊🍂🦊🍂🦊🍂🦊',
    '🐢🌿🐢🌿🐢🌿🐢',
    '🐧❄️🐧❄️🐧❄️🐧',
    '🦋🌸🦋🌸🦋🌸🦋',
    '🌟⭐🌟⭐🌟⭐🌟',
    '💖💗💖💗💖💗💖',
    '🎀🌸🎀🌸🎀🌸🎀',
    '🍬🍭🍬🍭🍬🍭🍬',
    '🌺🌸🌺🌸🌺🌸🌺',
  ];

  const getEmojisByTeamId = (teamId: string) => {
    let index = 0;
    if (teamId) {
      index = teamId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      index = index % emojiSets.length;
    }
    return emojiSets[index];
  };
  console.log(hidden);

  if (hidden && !changedPoints) {
    const emojis = getEmojisByTeamId(String((place ?? 1) - 1));
    return (
      <div
        className={`${styles['team']} ${place ? styles[`team--${place}`] : ''} ${styles['team--hidden']}`}
      >
        <div className={styles['team__place']}>{place}</div>
        <div className={styles['team__name']}>{emojis}</div>
      </div>
    );
  }

  return (
    <div className={`${styles['team']} ${place ? styles[`team--${place}`] : ''}`}>
      <div className={styles['team__place']}>{place}</div>
      <div className={styles['team__name']}>{team.name}</div>
      <div className={styles['team__points']}>
        <span>{originalPoints}</span>
        {changedPoints !== 0 && changedPoints !== undefined && (
          <span className={styles['team__add-points']}> ({changedPoints})</span>
        )}
      </div>
    </div>
  );
}

export default memo(Team);
