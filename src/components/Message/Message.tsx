import { UserLevel } from '@/app/types';
import { useMemo } from 'react';
import styles from './Message.module.scss';
import Image from 'next/image';

type MessageProps = {
  role: UserLevel;
  name: string;
  userId: string;
  authorId: string;
  text: string;
  avatar?: string;
  showAvatar?: boolean;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
};

export default function Message({
  role,
  name,
  userId,
  authorId,
  text,
  avatar,
  showAvatar = true,
  isFirstInGroup = false,
  isLastInGroup = false,
}: MessageProps) {
  const isIncoming = useMemo(() => userId !== authorId, [userId, authorId]);

  console.log('showAvatar:', showAvatar, 'text:', text);

  if (isIncoming) {
    return (
      <div
        className={`
          ${styles['message']} 
          ${styles['message_incoming']} 
          ${role === 'TEACHER' ? styles['message_teacher'] : ''}
          ${!showAvatar ? styles['message_no-avatar'] : ''}
          ${isFirstInGroup ? styles['message_first-in-group'] : ''}
          ${isLastInGroup ? styles['message_last-in-group'] : ''}
        `}
      >
        {showAvatar ? (
          <div className={styles['message__avatar']}>
            {avatar ? (
              <div
                className={styles['image']}
                style={{
                  backgroundImage: avatar
                    ? `url(${process.env.NEXT_PUBLIC_API_URL}${avatar})`
                    : 'none',
                }}
              />
            ) : (
              <span>{name?.[0]?.toUpperCase()}</span>
            )}
          </div>
        ) : (
          <div className={styles['message__avatar-spacer']} />
        )}
        <div className={styles['message__popup']}>
          <div className={styles['message__name']}>{name}</div>
          <div className={styles['message__text']}>{text}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
      ${styles['message']} 
      ${styles['message_my']}
      ${isFirstInGroup ? styles['message_first-in-group'] : ''}
      ${isLastInGroup ? styles['message_last-in-group'] : ''}
    `}
    >
      <div className={styles['message__popup']}>
        <div className={styles['message__text']}>{text}</div>
      </div>
    </div>
  );
}
