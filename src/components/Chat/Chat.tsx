'use client';

import { Message } from '@/app/types';
import ChatArea from './ChatArea/ChatArea';
import ChatInput from './ChatInput/ChatInput';
import styles from './Chat.module.scss';
import { useCallback, useState } from 'react';
import { useMutation } from '@apollo/client';
import { SEND_MESSAGE } from '@/graphql/mutations/SendMessage';

type ChatProps = {
  messages: Message[];
  userId: string;
  groupId: string;
  loading: boolean;
};

export default function Chat({ messages, userId, groupId, loading }: ChatProps) {
  const [message, setMessage] = useState('');
  const [sendMessage] = useMutation(SEND_MESSAGE);

  const handleSendMessage = useCallback(() => {
    if (!message.trim() || !userId || !groupId) return;

    sendMessage({
      variables: {
        authorId: userId,
        text: message.trim(),
        groupId: groupId,
      },
    });
    setMessage('');
  }, [userId, message, groupId, sendMessage]);

  return (
    <div className={styles['chat']}>
      <ChatArea messages={messages} userId={userId} loading={loading} />
      <ChatInput message={message} onChangeMessage={setMessage} onSend={handleSendMessage} />
    </div>
  );
}
