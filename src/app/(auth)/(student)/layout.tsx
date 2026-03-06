import { UserLevel } from '@/app/types';
import { AuthGuard } from '@/auth/AuthGuard';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={[UserLevel.Admin, UserLevel.Student, UserLevel.Teacher]}>
      {children}
    </AuthGuard>
  );
}
