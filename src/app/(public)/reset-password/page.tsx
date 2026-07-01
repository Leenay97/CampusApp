'use client';

import styles from '../register/RegisterPage.module.scss';
import { InputField } from '@/components/InputField/InputField';
import { useState, Suspense } from 'react';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import { useSearchParams, useRouter } from 'next/navigation';
import Section from '@/components/Section/Section';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Title from '@/components/Title/Title';
import Subtitle from '@/components/Subtitle/Subtitle';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { RESET_PASSWORD } from '@/graphql/mutations/ResetPassword';

function ResetPasswordForm() {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [done, setDone] = useState(false);
  const router = useRouter();

  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [resetPassword] = useGlobalLoadingMutation<
    { resetPassword: boolean },
    { token: string; password: string; confirmPassword: string }
  >(RESET_PASSWORD);

  async function handleReset() {
    try {
      const result = await resetPassword({ token, password, confirmPassword });
      if (result?.resetPassword) {
        setDone(true);
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (err) {
      console.error('Неизвестная ошибка:', err);
    }
  }

  if (!token) {
    return (
      <CenteredContainer>
        <Section>
          <Title noMargin>Ссылка недействительна</Title>
        </Section>
      </CenteredContainer>
    );
  }

  return (
    <CenteredContainer>
      <Section>
        <Title noMargin>Новый пароль</Title>
      </Section>
      <Section>
        <div className={styles['prohibited-section__content']}>
          {done ? (
            <Subtitle noMargin>Пароль изменён, сейчас перебросим на вход</Subtitle>
          ) : (
            <>
              <div>
                <Subtitle>Пароль*</Subtitle>
                <InputField width="100%" type="password" value={password} onChange={setPassword} />
              </div>

              <div>
                <Subtitle>Подтверди пароль*</Subtitle>
                <InputField
                  width="100%"
                  type="password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                />
              </div>

              <PrimaryButton width="100%" onClick={handleReset}>
                Сменить пароль
              </PrimaryButton>
            </>
          )}
        </div>
      </Section>
    </CenteredContainer>
  );
}

function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

export default ResetPasswordPage;
