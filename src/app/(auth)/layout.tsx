import { AuthGuard } from '@/auth/AuthGuard';
import Header from '@components/Header/Header';
import { UserLevel } from '../types';
import ChatButton from '@/components/Chat/ChatButton/ChatButton';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={[UserLevel.Admin, UserLevel.Teacher, UserLevel.Student]}>
      <Header />
      <ChatButton />
      {children}
    </AuthGuard>
  );
}
