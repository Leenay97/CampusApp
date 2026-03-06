'use client';

import { useMutation, useQuery } from '@apollo/client';
import { queries } from '@graphql/queries/index';
import styles from './style.module.scss';
import { InputField } from '@/components/InputField/InputField';
import { useState } from 'react';
import { UserCustomSelect } from '@/components/UserCustomSelect/UserCustomSelect';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import { useSearchParams } from 'next/navigation';
import mutations from '@/graphql/mutations';
import { User } from '@/app/types';

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
    <div className="centered-container">
      <div className="flex-container">
        <div className={styles['prohibited-section']}>
          <div className={styles['prohibited-section__content']}>
            <h1 className="title">Ну привет, училка</h1>
            <h2 className="subtitle">Найди себя</h2>
            <UserCustomSelect
              users={teachers?.teachers}
              isLoading={teachersLoading}
              onChange={handleAddTeacher}
            />
          </div>
        </div>
        {selectedTeacher.id && (
          <div className={styles['prohibited-section']}>
            <div className={styles['prohibited-section__content']}>
              <h2 className="subtitle">Логин</h2>
              <InputField width="200px" value={login} onChange={setLogin} />
              <h2 className="subtitle">Пароль</h2>
              <InputField width="200px" type="password" value={password} onChange={setPassword} />
              <h2 className="subtitle">Подтверди пароль</h2>
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
          </div>
        )}
      </div>
    </div>
  );
}

export default RegisterTeacherPage;
