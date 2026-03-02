import { AuthGuard } from '@/auth/AuthGuard';
import Header from '@components/Header/Header';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['ADMIN', 'TEACHER']}>
      <Header />
      {children}
    </AuthGuard>
  );
}
