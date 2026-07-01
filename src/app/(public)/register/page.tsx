'use client';

import styles from './RegisterPage.module.scss';
import { InputField } from '@/components/InputField/InputField';
import { useState, Suspense } from 'react';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import { useSearchParams } from 'next/navigation';
import Section from '@/components/Section/Section';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Title from '@/components/Title/Title';
import Subtitle from '@/components/Subtitle/Subtitle';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { RegisterStudentResponse, User } from '@/app/types';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { REGISTER_STUDENT } from '@/graphql/mutations/RegisterStudent';
import { useQuery } from '@apollo/client';
import queries from '@/graphql/queries';
import { CustomSelect } from '@/components/CustomSelect/CustomSelect';
import Loader from '@/components/Loader/Loaader';

function RegisterForm() {
  const [selectedStudent, setSelectedStudent] = useState<User>({} as User);
  const [name, setName] = useState<string>('');
  const [login, setLogin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const router = useRouter();
  const { setUser } = useUser();

  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const { data, loading } = useQuery(queries.GET_STUDENTS_BY_GROUP, {
    variables: { groupId: token },
    skip: !token,
  });
  const unregisteredStudents = (data?.students || []).filter((student: User) => !student.isActive);

  const [registerStudent] = useGlobalLoadingMutation(REGISTER_STUDENT);

  function handleSelectStudent(student: User) {
    setSelectedStudent(student);
  }

  async function handleRegister() {
    try {
      const result = (await registerStudent({
        token,
        id: selectedStudent.id,
        name,
        login,
        password,
        confirmPassword,
      })) as RegisterStudentResponse;

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
        <Title noMargin>Hey, campus student!</Title>
      </Section>
      <Section>
        <div className={styles['prohibited-section__content']}>
          <Subtitle noMargin>Найди себя*</Subtitle>
          {loading ? (
            <Loader />
          ) : (
            <CustomSelect items={unregisteredStudents} onChange={handleSelectStudent} />
          )}
        </div>
      </Section>
      {selectedStudent.id && (
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
      )}
    </CenteredContainer>
  );
}

function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}

export default RegisterPage;
