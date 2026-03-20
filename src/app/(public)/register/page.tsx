'use client';

import styles from './style.module.scss';
import { InputField } from '@/components/InputField/InputField';
import { useState } from 'react';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import { useSearchParams } from 'next/navigation';
import Section from '@/components/Section/Section';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Title from '@/components/Title/Title';
import Subtitle from '@/components/Subtitle/Subtitle';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { RegisterStudentResponse } from '@/app/types';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { REGISTER_STUDENT } from '@/graphql/mutations/RegisterStudent';

function RegisterPage() {
  const [name, setName] = useState<string>('');
  const [login, setLogin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const router = useRouter();
  const { setUser } = useUser();

  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [registerStudent] = useGlobalLoadingMutation(REGISTER_STUDENT);

  async function handleRegister() {
    try {
      const result = (await registerStudent({
        token,
        name,
        login,
        password,
        confirmPassword,
      })) as RegisterStudentResponse;

      console.log(result);

      if (result?.registerStudent?.token) {
        localStorage.setItem('token', result.registerStudent.token);
        setUser(result.registerStudent.user);
        router.push('/');
      } else if (result.errors) {
        console.error('Ошибки GraphQL:', result.errors);
      }
    } catch (err) {
      console.error('Неизвестная ошибка:', err);
    }
  }

  return (
    <CenteredContainer>
      <Section>
        <Title>Hey, campus student!</Title>
      </Section>
      <Section>
        <div className={styles['prohibited-section__content']}>
          <div>
            <Subtitle>Английское имя*</Subtitle>
            <InputField width="100%" value={name} onChange={setName} />
          </div>
          <div>
            <Subtitle>Логин*</Subtitle>
            <InputField width="100%" value={login} onChange={setLogin} />
          </div>

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

          <PrimaryButton width="100%" onClick={handleRegister}>
            Зарегистрироваться
          </PrimaryButton>
        </div>
      </Section>
    </CenteredContainer>
  );
}

export default RegisterPage;
