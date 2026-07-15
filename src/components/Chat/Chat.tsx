'use client';

import { Message, MessageType } from '@/app/types';
import ChatArea from './ChatArea/ChatArea';
import ChatInput from './ChatInput/ChatInput';
import styles from './Chat.module.scss';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from '@apollo/client';
import { useLoading } from '@/contexts/LoadingContext';
import { SEND_MESSAGE } from '@/graphql/mutations/SendMessage';

type ChatProps = {
  messages: Message[];
  userId: string;
  groupId: string;
  loading: boolean;
  isStaffChat?: boolean;
};

type PendingMessage = {
  id: string;
  text: string;
  type: MessageType;
  createdAt: string;
};

export default function Chat({
  messages,
  userId,
  groupId,
  loading,
  isStaffChat = false,
}: ChatProps) {
  const [message, setMessage] = useState('');
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const [sendMessage] = useMutation(SEND_MESSAGE);
  const { showLoading, hideLoading } = useLoading();

  // Убираем pending-сообщение, когда его подтверждённая копия приходит по подписке
  useEffect(() => {
    const newOwnTexts: string[] = [];
    for (const msg of messages) {
      if (knownIdsRef.current.has(msg.id)) continue;
      knownIdsRef.current.add(msg.id);
      if (msg.author.id === userId) newOwnTexts.push(msg.text);
    }
    if (newOwnTexts.length === 0) return;

    setPendingMessages((prev) => {
      if (prev.length === 0) return prev;
      const rest = [...prev];
      for (const text of newOwnTexts) {
        const index = rest.findIndex((p) => p.text === text);
        if (index !== -1) rest.splice(index, 1);
      }
      return rest.length === prev.length ? prev : rest;
    });
  }, [messages, userId]);

  const sendChatMessage = useCallback(
    (text: string, type: MessageType) => {
      if (!text || !userId) return;

      const pendingId = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setPendingMessages((prev) => [
        ...prev,
        { id: pendingId, text, type, createdAt: Date.now().toString() },
      ]);

      sendMessage({ variables: { authorId: userId, text, groupId, isStaffChat, type } }).catch(
        () => {
          setPendingMessages((prev) => prev.filter((p) => p.id !== pendingId));
          showLoading('ERROR');
          setTimeout(hideLoading, 1500);
        },
      );
    },
    [userId, groupId, isStaffChat, sendMessage, showLoading, hideLoading],
  );

  const handleSendMessage = useCallback(() => {
    const text = message.trim();
    if (!text) return;
    setMessage('');
    sendChatMessage(text, 'TEXT');
  }, [message, sendChatMessage]);

  const handleSendSticker = useCallback(
    (stickerUrl: string) => sendChatMessage(stickerUrl, 'STICKER'),
    [sendChatMessage],
  );

  const displayMessages = useMemo<Message[]>(() => {
    return [
      ...messages,
      ...pendingMessages.map(
        (p) =>
          ({
            id: p.id,
            groupId,
            text: p.text,
            type: p.type,
            createdAt: p.createdAt,
            author: { id: userId },
            pending: true,
          }) as Message,
      ),
    ];
  }, [messages, pendingMessages, groupId, userId]);

  return (
    <div className={`${styles['chat']} ${isStaffChat ? styles['chat--staff'] : ''}`}>
      <ChatArea messages={displayMessages} userId={userId} loading={loading} />
      <ChatInput
        message={message}
        onChangeMessage={setMessage}
        onSend={handleSendMessage}
        onSendSticker={handleSendSticker}
      />
    </div>
  );
}
