import { MessageType, UserLevel } from '@/app/types';
import { useMemo } from 'react';
import Image from 'next/image';
import styles from './Message.module.scss';
import Avatar from '../Avatar/Avatar';

type MessageProps = {
  role: UserLevel;
  name: string;
  userId: string;
  authorId: string;
  text: string;
  type?: MessageType;
  avatar?: string;
  showAvatar?: boolean;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  isPending?: boolean;
};

export default function Message({
  role,
  name,
  userId,
  authorId,
  text,
  type = 'TEXT',
  avatar,
  showAvatar = true,
  isFirstInGroup = false,
  isLastInGroup = false,
  isPending = false,
}: MessageProps) {
  const isIncoming = useMemo(() => userId !== authorId, [userId, authorId]);
  const isSticker = type === 'STICKER';

  const popupClassName = `${styles['message__popup']} ${
    isSticker ? styles['message__popup_sticker'] : ''
  }`;

  const content = isSticker ? (
    <Image
      src={text}
      alt="Стикер"
      width={120}
      height={120}
      unoptimized
      className={styles['message__sticker']}
    />
  ) : (
    <div className={styles['message__text']}>{text}</div>
  );

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
          <Avatar className={styles['message__avatar']} name={name} photoUrl={avatar} size={35} />
        ) : (
          <div className={styles['message__avatar-spacer']} />
        )}
        <div className={popupClassName}>
          {!isSticker && <div className={styles['message__name']}>{name}</div>}
          {content}
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
      ${isPending ? styles['message_pending'] : ''}
    `}
    >
      <div className={popupClassName}>{content}</div>
    </div>
  );
}
