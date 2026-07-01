'use client';

import { AuthGuard } from '@/auth/AuthGuard';
import Header from '@components/Header/Header';
import { UserLevel } from '../types';

type AuthLayoutProps = { children: React.ReactNode };

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <AuthGuard allowedRoles={[UserLevel.Admin, UserLevel.Teacher, UserLevel.Student]}>
      <Header />
      {children}
    </AuthGuard>
  );
}
