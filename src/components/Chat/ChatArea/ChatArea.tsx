import { Message as MessageType } from '@/app/types';
import Message from '../../Message/Message';
import styles from './ChatArea.module.scss';
import { useEffect, useMemo, useRef } from 'react';

type ChatAreaProps = {
  messages: MessageType[];
  userId: string;
  loading?: boolean;
};

export default function ChatArea({ messages, userId, loading }: ChatAreaProps) {
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
    <div className={styles['chat-area']} ref={containerRef}>
      {loading && <div className={styles['loading']}>Загрузка</div>}
      {groupedMessages.map((msg) => (
        <Message
          key={msg.id}
          userId={userId}
          authorId={msg.author.id}
          text={msg.text}
          name={msg.author.name}
          role={msg.author.userLevel}
          avatar={msg.author.photoUrl}
          showAvatar={msg.showAvatar}
          isFirstInGroup={msg.isFirstInGroup}
          isLastInGroup={msg.isLastInGroup}
        />
      ))}
    </div>
  );
}
