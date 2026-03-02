'use client';
import { JSX, useState } from 'react';
import style from './style.module.scss';
import { InputField } from '@/components/InputField/InputField';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import Logo from '@/assets/img/logo.png';
import Image from 'next/image';
import { useMutation } from '@apollo/client';
import mutations from '@/graphql/mutations';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

export default function LoginPage(): JSX.Element {
  const [login, setLogin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginUser] = useMutation(mutations.LOGIN);
  const router = useRouter();
  const { setUser } = useUser();

  async function handleLogin() {
    try {
      const { data } = await loginUser({ variables: { login, password } });
      localStorage.setItem('token', data.login.token);
      setUser(data.login.user);
      console.log(data.login.user);
      router.push('/');
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="fullscreen-container">
      <div className="centered-container">
        <div className={style['section']}>
          <div className={style['section__header']}>
            <p className="title">Hey, friend!</p>
            <Image className={style['section__logo']} src={Logo} alt="Логотип" />
          </div>
          <div className={style['section__input']}>
            <h1 className="subtitle">Логин</h1>
            <InputField value={login} onChange={setLogin} />
          </div>
          <div className={style['section__input']}>
            <h2 className="subtitle">Пароль</h2>
            <InputField value={password} onChange={setPassword} />
          </div>
          <PrimaryButton onClick={handleLogin}>Войти</PrimaryButton>
        </div>
      </div>
    </div>
  );
}
