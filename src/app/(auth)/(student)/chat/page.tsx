'use client';

import { useMemo, useEffect } from 'react';
import { Message as MessageType } from '@/app/types';
import { useUser } from '@/contexts/UserContext';
import { MESSAGE_SENT } from '@/graphql/subscriptions/MessageSent';
import { GET_MESSAGES } from '@/graphql/queries/GetMessages';
import Chat from '@/components/Chat/Chat';
import { useQuery } from '@apollo/client';

export default function GroupChat() {
  const { user } = useUser();

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

  return (
    <Chat
      messages={messages}
      loading={loading}
      userId={user?.id ?? ''}
      groupId={user?.group?.id ?? ''}
    />
  );
}
