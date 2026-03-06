import { AuthGuard } from '@/auth/AuthGuard';
import Header from '@components/Header/Header';
import { UserLevel } from '../types';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={[UserLevel.Admin, UserLevel.Teacher]}>
      <Header />
      {children}
    </AuthGuard>
  );
}
