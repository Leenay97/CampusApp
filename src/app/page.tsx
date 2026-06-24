'use client';

import { AuthGuard } from '@/auth/AuthGuard';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import ChatButton from '@/components/Chat/ChatButton/ChatButton';
import StaffChatButton from '@/components/Chat/StaffChatButton/StaffChatButton';
import Header from '@/components/Header/Header';
import { useUser } from '@/contexts/UserContext';
import TeamRaiting from '@components/TeamRaiting/TeamRaiting';

export default function Home() {
  const { user } = useUser();
  return (
    <AuthGuard>
      <CenteredContainer>
        <Header />
        <TeamRaiting />
      </CenteredContainer>
      <ChatButton />
      {user?.userLevel !== 'STUDENT' && <StaffChatButton />}
    </AuthGuard>
  );
}
