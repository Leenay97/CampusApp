import { UserLevel } from '@/app/types';
import { useMemo } from 'react';
import styles from './Message.module.scss';

type MessageProps = {
  role: UserLevel;
  name: string;
  userId: string;
  authorId: string;
  text: string;
  avatar: string;
};

export default function Message({ role, name, userId, authorId, text, avatar }: MessageProps) {
  const isIncoming = useMemo(() => userId !== authorId, [userId, authorId]);

  if (isIncoming) {
    return (
      <div
        className={`${styles['message']} ${styles['message_incoming']} ${role === 'TEACHER' ? styles['message_teacher'] : ''}`}
      >
        <div className={styles['message__avatar']}></div>
        <div className={styles['message__popup']}>
          <div className={styles['message__name']}>{name}</div>
          <div className={styles['message__text']}>{text}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles['message']} ${styles['message_my']}`}>
      <div className={styles['message__popup']}>
        <div className={styles['message__text']}>{text}</div>
      </div>
    </div>
  );
}
