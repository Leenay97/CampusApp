import { AuthGuard } from '@/auth/AuthGuard';
import Header from '@components/Header/Header';
import { UserLevel } from '../types';
import ChatButton from '@/components/Chat/ChatButton/ChatButton';

type AuthLayoutProps = { children: React.ReactNode };

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <AuthGuard allowedRoles={[UserLevel.Admin, UserLevel.Teacher, UserLevel.Student]}>
      <Header />
      <ChatButton />
      {children}
    </AuthGuard>
  );
}
