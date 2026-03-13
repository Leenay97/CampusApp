'use client';

import { useMutation, useQuery } from '@apollo/client';
import { queries } from '@graphql/queries/index';
import styles from './style.module.scss';
import { InputField } from '@/components/InputField/InputField';
import { useState } from 'react';
import { CustomSelect } from '@/components/CustomSelect/CustomSelect';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import { useSearchParams } from 'next/navigation';
import mutations from '@/graphql/mutations';
import { User } from '@/app/types';
import { useUser } from '@/contexts/UserContext';
import Section from '@/components/Section/Section';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Title from '@/components/Title/Title';
import Subtitle from '@/components/Subtitle/Subtitle';

function RegisterPage() {
  const [selectedStudent, setSelectedStudent] = useState<User>({} as User);
  const [name, setName] = useState<string>('');
  const [login, setLogin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  console.log(token);

  const { loading, data } = useQuery(queries.GET_STUDENTS_BY_GROUP_ID, {
    variables: { groupId: token },
  });
  const [registerStudent] = useMutation(mutations.REGISTER_STUDENT, {
    variables: { token, id: selectedStudent?.id, name, login, password, confirmPassword },
  });

  const unregisteredStudents = data?.students.filter((student: User) => !student.isActive);

  function handleAddStudent(value: User) {
    setSelectedStudent(value);
  }

  async function handleRegister() {
    try {
      const result = await registerStudent({
        variables: {
          id: selectedStudent?.id,
          token,
          login,
          password,
          confirmPassword,
        },
      });
      localStorage.setItem('token', result?.data?.registerStudent?.token);
      window.location.href = '/';
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <CenteredContainer noPadding>
      <Section>
        <Title>Hey, campus student!</Title>
        <div>
          <Subtitle>Найди себя</Subtitle>
          <CustomSelect
            items={unregisteredStudents}
            isLoading={loading}
            onChange={handleAddStudent}
          />
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

export default RegisterPage;
