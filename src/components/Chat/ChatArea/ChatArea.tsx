import { Message as MessageType } from '@/app/types';
import Message from '../../Message/Message';
import Loader from '../../Loader/Loaader';
import styles from './ChatArea.module.scss';
import { useEffect, useMemo, useRef } from 'react';

type ChatAreaProps = {
  messages: MessageType[];
  userId: string;
  loading?: boolean;
  onReply?: (message: MessageType) => void;
  onReact?: (messageId: string, emoji: string) => void;
};

export default function ChatArea({ messages, userId, loading, onReply, onReact }: ChatAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      const timeA = parseInt(a.createdAt);
      const timeB = parseInt(b.createdAt);
      return timeA - timeB;
    });
  }, [messages]);

  const groupedMessages = useMemo(() => {
    return sortedMessages.map((msg, index, arr) => {
      const prevMsg = arr[index - 1];
      const nextMsg = arr[index + 1];

      const isFirstInGroup = !prevMsg || prevMsg.author.id !== msg.author.id;
      const isLastInGroup = !nextMsg || nextMsg.author.id !== msg.author.id;
      const showAvatar = isLastInGroup && msg.author.id !== userId;

      return {
        ...msg,
        showAvatar,
        isFirstInGroup,
        isLastInGroup,
      };
    });
  }, [sortedMessages, userId]);

  return (
    <div className={styles['chat-area']} ref={containerRef} data-chat-scroll>
      {loading && <div className={styles['chat-area__empty']}>Загрузка...</div>}
      {!loading && !groupedMessages.length && (
        <div className={styles['chat-area__empty']}>Сообщений еще нет</div>
      )}
      {groupedMessages.map((msg) => (
        <Message
          key={msg.id}
          userId={userId}
          authorId={msg.author.id}
          text={msg.text}
          type={msg.type}
          name={msg.author.name}
          role={msg.author.userLevel}
          avatar={msg.author.photoUrl}
          showAvatar={msg.showAvatar}
          isFirstInGroup={msg.isFirstInGroup}
          isLastInGroup={msg.isLastInGroup}
          isPending={msg.pending}
          replyTo={msg.replyTo}
          reactions={msg.reactions}
          myReaction={msg.myReaction}
          onReply={onReply ? () => onReply(msg) : undefined}
          onReact={onReact ? (emoji) => onReact(msg.id, emoji) : undefined}
        />
      ))}
    </div>
  );
}
