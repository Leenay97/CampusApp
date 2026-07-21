import { MessageReplyPreview, MessageType, ReactionCount, UserLevel } from '@/app/types';
import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './Message.module.scss';
import Avatar from '../Avatar/Avatar';

const REACTIONS = ['👍🏻', '🤣', '👹', '❤️', '🎉', '😭'];

// Примерная высота попапа с реакциями, чтобы понять, влезает ли он сверху
const ACTIONS_POPUP_HEIGHT = 130;

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
  replyTo?: MessageReplyPreview | null;
  reactions?: ReactionCount[];
  myReaction?: string | null;
  onReply?: () => void;
  onReact?: (emoji: string) => void;
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
  replyTo,
  reactions,
  myReaction,
  onReply,
  onReact,
}: MessageProps) {
  const isIncoming = useMemo(() => userId !== authorId, [userId, authorId]);
  const isSticker = type === 'STICKER';
  const isInteractive = !isPending;
  const [showActions, setShowActions] = useState(false);
  const [actionsBelow, setActionsBelow] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showActions) return;
    function handleClickOutside(event: MouseEvent) {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showActions]);

  function handleToggleActions() {
    if (!isInteractive) return;
    if (!showActions && actionsRef.current) {
      const wrapperTop = actionsRef.current.getBoundingClientRect().top;
      const container = actionsRef.current.closest('[data-chat-scroll]');
      const containerTop = container ? container.getBoundingClientRect().top : 0;
      setActionsBelow(wrapperTop - containerTop < ACTIONS_POPUP_HEIGHT);
    }
    setShowActions((v) => !v);
  }

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

  const replyBlock = replyTo && (
    <div className={styles['message__reply']}>
      <div className={styles['message__reply-author']}>{replyTo.author.name}</div>
      <div className={styles['message__reply-text']}>
        {replyTo.type === 'STICKER' ? 'Стикер' : replyTo.text}
      </div>
    </div>
  );

  function handlePick(emoji: string) {
    onReact?.(emoji);
    setShowActions(false);
  }

  function handleReplyClick() {
    onReply?.();
    setShowActions(false);
  }

  const actionsPanel = showActions && (
    <div
      className={`${styles['message__actions']} ${
        actionsBelow ? styles['message__actions--below'] : ''
      }`}
    >
      <div className={styles['message__actions-reactions']}>
        {REACTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className={`${styles['message__actions-reaction']} ${
              myReaction === emoji ? styles['message__actions-reaction--active'] : ''
            }`}
            onClick={() => handlePick(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
      <button type="button" className={styles['message__actions-reply']} onClick={handleReplyClick}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 17 4 12 9 7" />
          <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
        </svg>
        Ответить
      </button>
    </div>
  );

  const reactionsRow = reactions && reactions.length > 0 && (
    <div className={styles['message__reactions']}>
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          type="button"
          className={`${styles['message__reaction']} ${
            myReaction === reaction.emoji ? styles['message__reaction--mine'] : ''
          }`}
          onClick={() => onReact?.(reaction.emoji)}
          disabled={!isInteractive}
        >
          <span>{reaction.emoji}</span>
          <span className={styles['message__reaction-count']}>{reaction.count}</span>
        </button>
      ))}
    </div>
  );

  if (isIncoming) {
    return (
      <div
        className={`
          ${styles['message']}
          ${styles['message_incoming']}
          ${role === 'TEACHER' ? styles['message_teacher'] : ''}
          ${role === 'ADMIN' ? styles['message_admin'] : ''}
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
        <div className={styles['message__content']}>
          <div className={styles['message__bubble-wrapper']} ref={actionsRef}>
            <div className={popupClassName} onClick={handleToggleActions}>
              {replyBlock}
              {!isSticker && <div className={styles['message__name']}>{name}</div>}
              {content}
            </div>
            {actionsPanel}
          </div>
          {reactionsRow}
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
      <div className={styles['message__content']}>
        <div className={styles['message__bubble-wrapper']} ref={actionsRef}>
          <div className={popupClassName} onClick={handleToggleActions}>
            {replyBlock}
            {content}
          </div>
          {actionsPanel}
        </div>
        {reactionsRow}
      </div>
    </div>
  );
}
