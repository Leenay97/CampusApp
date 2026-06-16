'use client';

import Message from '@/components/Message/Message';
import styles from './Chat.module.scss';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Message as MessageType } from '@/app/types';
import { useUser } from '@/contexts/UserContext';
import { SEND_MESSAGE } from '@/graphql/mutations/SendMessage';
import { MESSAGE_SENT } from '@/graphql/subscriptions/MessageSent';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import { GET_MESSAGES } from '@/graphql/queries/GetMessages';

export default function GroupChat() {
  const [message, setMessage] = useState('');
  const [sendMessage] = useMutation(SEND_MESSAGE);
  const { user } = useUser();
  const containerRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery(GET_MESSAGES, {
    variables: { groupId: user?.group?.id || '' },
    skip: !user?.group?.id,
  });

  const { data: subscriptionData } = useSubscription(MESSAGE_SENT, {
    variables: { groupId: user?.group?.id || '' },
    skip: !user?.group?.id,
  });

  const messages: MessageType[] = useMemo(() => {
    const existing = data?.getMessages || [];
    const newMsg = subscriptionData?.messageSent;

    if (newMsg && !existing.some((msg: MessageType) => msg.id === newMsg.id)) {
      return [...existing, newMsg];
    }
    return existing;
  }, [data, subscriptionData]);

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      const timeA = parseInt(a.createdAt);
      const timeB = parseInt(b.createdAt);
      return timeA - timeB;
    });
  }, [messages]);

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

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [sortedMessages]);

  return (
    <div className={styles['chat']}>
      <div className={styles['chat__container']} ref={containerRef}>
        {sortedMessages.map((msg) => (
          <Message
            key={msg.id}
            userId={user?.id || ''}
            authorId={msg.author.id}
            text={msg.text}
            name={msg.author.name}
            role={msg.author.userLevel}
            avatar=""
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
        <button className={styles['chat__send-button']} onClick={handleSendMessage}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            rotate="45deg"
          >
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}
