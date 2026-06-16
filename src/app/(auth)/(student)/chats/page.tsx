'use client';

import Message from '@/components/Message/Message';
import styles from './Chat.module.scss';
import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Message as MessageType } from '@/app/types';
import { useUser } from '@/contexts/UserContext';
import { SEND_MESSAGE } from '@/graphql/mutations/SendMessage';
import { MESSAGE_SENT } from '@/graphql/subscriptions/MessageSent';
import { useMutation, useQuery } from '@apollo/client';
import { GET_MESSAGES } from '@/graphql/queries/GetMessages';

export default function GroupChat() {
  const [message, setMessage] = useState('');
  const [sendMessage] = useMutation(SEND_MESSAGE);
  const { user } = useUser();
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, loading, subscribeToMore } = useQuery(GET_MESSAGES, {
    variables: { groupId: user?.group?.id || '' },
    skip: !user?.group?.id,
  });

  useEffect(() => {
    if (!user?.group?.id) return;

    const unsubscribe = subscribeToMore({
      document: MESSAGE_SENT,
      variables: { groupId: user.group.id },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        const newMessage = subscriptionData.data.messageSent;

        const exists = prev.getMessages.some((msg: MessageType) => msg.id === newMessage.id);
        if (exists) return prev;

        return {
          ...prev,
          getMessages: [...prev.getMessages, newMessage],
        };
      },
    });

    return () => unsubscribe();
  }, [subscribeToMore, user?.group?.id]);

  const messages: MessageType[] = useMemo(() => {
    return data?.getMessages || [];
  }, [data]);

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
      const showAvatar = isLastInGroup;

      return {
        ...msg,
        showAvatar,
        isFirstInGroup,
        isLastInGroup,
      };
    });
  }, [sortedMessages]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [groupedMessages]);

  const handleSendMessage = useCallback(() => {
    if (!message.trim() || !user?.id || !user?.group?.id) return;

    sendMessage({
      variables: {
        authorId: user.id,
        text: message.trim(),
        groupId: user.group.id,
      },
    });
    setMessage('');
  }, [user, message, sendMessage]);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className={styles['chat']}>
      <div className={styles['chat__container']} ref={containerRef}>
        {groupedMessages.map((msg) => (
          <Message
            key={msg.id}
            userId={user?.id ?? ''}
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
      <div className={styles['chat__input-field']}>
        <TextareaAutosize
          className={styles['chat__input']}
          placeholder="Сообщение"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <button
          className={styles['chat__send-button']}
          onClick={handleSendMessage}
          disabled={!message.trim()}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}
