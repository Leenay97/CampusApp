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
  isStaffChat?: boolean;
};

export default function Chat({
  messages,
  userId,
  groupId,
  loading,
  isStaffChat = false,
}: ChatProps) {
  const [message, setMessage] = useState('');
  const [sendMessage] = useMutation(SEND_MESSAGE);

  const handleSendMessage = useCallback(() => {
    if (!message.trim() || !userId) return;

    sendMessage({
      variables: {
        authorId: userId,
        text: message.trim(),
        groupId: groupId,
        isStaffChat,
      },
    });
    setMessage('');
  }, [userId, message, groupId, isStaffChat, sendMessage]);

  return (
    <div className={styles['chat']}>
      <ChatArea messages={messages} userId={userId} loading={loading} />
      <ChatInput message={message} onChangeMessage={setMessage} onSend={handleSendMessage} />
    </div>
  );
}
