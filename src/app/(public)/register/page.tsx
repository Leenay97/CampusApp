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
import { useUser } from '@/contexts/UserContext';

function RegisterPage() {
  const [selectedStudent, setSelectedStudent] = useState<User>({} as User);
  const [name, setName] = useState<string>('');
  const [login, setLogin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const { setUser } = useUser();

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
    <div className="centered-container no-padding">
      <div className="flex-container">
        <div className="section">
          <h1 className="title">Hey, campus student!</h1>
          <div>
            <h2 className="subtitle">Найди себя</h2>
            <UserCustomSelect
              users={unregisteredStudents}
              isLoading={loading}
              onChange={handleAddStudent}
            />
          </div>
        </div>
        {selectedStudent.id && (
          <div className={styles['prohibited-section']}>
            <div className={styles['prohibited-section__content']}>
              <div>
                <h2 className="subtitle">Английское имя*</h2>
                <InputField width="100%" value={name} onChange={setName} />
              </div>
              <div>
                <h2 className="subtitle">Логин*</h2>
                <InputField width="100%" value={login} onChange={setLogin} />
              </div>

              <div>
                <h2 className="subtitle">Пароль*</h2>
                <InputField width="100%" type="password" value={password} onChange={setPassword} />
              </div>

              <div>
                <h2 className="subtitle">Подтверди пароль*</h2>
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
          </div>
        )}
      </div>
    </div>
  );
}

export default RegisterPage;
