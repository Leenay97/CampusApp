'use client';

import { AuthGuard } from '@/auth/AuthGuard';
import Header from '@components/Header/Header';
import { UserLevel } from '../types';
import ChatButton from '@/components/Chat/ChatButton/ChatButton';
import StaffChatButton from '@/components/Chat/StaffChatButton/StaffChatButton';
import { useUser } from '@/contexts/UserContext';

type AuthLayoutProps = { children: React.ReactNode };

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { user } = useUser();

  return (
    <AuthGuard allowedRoles={[UserLevel.Admin, UserLevel.Teacher, UserLevel.Student]}>
      <Header />
      <ChatButton />
      {user?.userLevel !== 'STUDENT' && <StaffChatButton />}
      {children}
    </AuthGuard>
  );
}
