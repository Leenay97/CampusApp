import { AuthGuard } from '@/auth/AuthGuard';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={['ADMIN']}>{children}</AuthGuard>;
}
