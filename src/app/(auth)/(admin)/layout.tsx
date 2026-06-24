import { AuthGuard } from '@/auth/AuthGuard';

type AuthLayoutProps = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <AuthGuard allowedRoles={['ADMIN']}>{children}</AuthGuard>;
}
