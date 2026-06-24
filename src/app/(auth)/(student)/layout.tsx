import { UserLevel } from '@/app/types';
import { AuthGuard } from '@/auth/AuthGuard';

type AuthLayoutProps = { children: React.ReactNode };

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <AuthGuard allowedRoles={[UserLevel.Admin, UserLevel.Student, UserLevel.Teacher]}>
      {children}
    </AuthGuard>
  );
}
