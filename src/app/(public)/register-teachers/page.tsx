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
import Section from '@/components/Section/Section';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Title from '@/components/Title/Title';
import Subtitle from '@/components/Subtitle/Subtitle';

function RegisterTeacherPage() {
  const [selectedTeacher, setSelectedTeacher] = useState<User>({} as User);
  const [login, setLogin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  console.log(token);

  const { loading: teachersLoading, data: teachers } = useQuery(queries.GET_TEACHERS);
  const [registerTeacher] = useMutation(mutations.REGISTER_TEACHER);

  function handleAddTeacher(value: User) {
    setSelectedTeacher(value);
  }

  async function handleRegister() {
    try {
      const result = await registerTeacher({
        variables: {
          id: selectedTeacher?.id,
          token,
          login,
          password,
          confirmPassword,
        },
      });
      console.log(result);
      localStorage.setItem('token', result?.data?.registerTeacher?.token);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <CenteredContainer>
      <Section>
        <div className={styles['prohibited-section__content']}>
          <Title>Ну привет, училка</Title>
          <Subtitle>Найди себя</Subtitle>
          <CustomSelect
            items={teachers?.teachers}
            isLoading={teachersLoading}
            onChange={handleAddTeacher}
          />
        </div>
      </Section>
      {selectedTeacher.id && (
        <Section>
          <div className={styles['prohibited-section__content']}>
            <Subtitle>Логин</Subtitle>
            <InputField width="200px" value={login} onChange={setLogin} />
            <Subtitle>Пароль</Subtitle>
            <InputField width="200px" type="password" value={password} onChange={setPassword} />
            <Subtitle>Подтверди пароль</Subtitle>
            <InputField
              width="200px"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
            <PrimaryButton onClick={handleRegister} width="200px">
              Зарегистрироваться
            </PrimaryButton>
          </div>
        </Section>
      )}
    </CenteredContainer>
  );
}

export default RegisterTeacherPage;
