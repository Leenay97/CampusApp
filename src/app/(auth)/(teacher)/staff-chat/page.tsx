'use client';

import { useMemo, useEffect } from 'react';
import { Message as MessageType } from '@/app/types';
import { useUser } from '@/contexts/UserContext';
import { STAFF_MESSAGE_SENT } from '@/graphql/subscriptions/StaffMessageSent';
import { GET_MESSAGES } from '@/graphql/queries/GetMessages';
import Chat from '@/components/Chat/Chat';
import { useQuery } from '@apollo/client';

export default function StaffChat() {
  const { user } = useUser();

  const { data, loading, subscribeToMore } = useQuery(GET_MESSAGES, {
    variables: { groupId: process.env.NEXT_PUBLIC_TEACHERS_CHAT_KEY || '' },
    skip: !process.env.NEXT_PUBLIC_TEACHERS_CHAT_KEY,
  });

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_TEACHERS_CHAT_KEY) return;

    const unsubscribe = subscribeToMore({
      document: STAFF_MESSAGE_SENT,
      variables: { groupId: process.env.NEXT_PUBLIC_TEACHERS_CHAT_KEY },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        const newMessage = subscriptionData.data.staffMessageSent;

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

  console.log(messages);

  return (
    <Chat
      messages={messages}
      loading={loading}
      userId={user?.id ?? ''}
      groupId={process.env.NEXT_PUBLIC_TEACHERS_CHAT_KEY ?? ''}
    />
  );
}
