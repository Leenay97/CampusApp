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
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import FullscreenContainer from '@/components/FullscreenContainer/FullscreenContainer';
import Title from '@/components/Title/Title';
import Subtitle from '@/components/Subtitle/Subtitle';

export default function LoginPage(): JSX.Element {
  const [login, setLogin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginUser] = useMutation(mutations.LOGIN);
  const router = useRouter();
  const { setUser } = useUser();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      const { data } = await loginUser({ variables: { login, password } });
      localStorage.setItem('token', data.login.token);
      console.log(data);
      setUser(data.login.user);
      router.push('/');
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <FullscreenContainer>
      <CenteredContainer>
        <form className={style['section']} onSubmit={handleLogin}>
          <div className={style['section__header']}>
            <Title>Hey, friend!</Title>
            <Image className={style['section__logo']} src={Logo} alt="Логотип" />
          </div>

          <div className={style['section__input']}>
            <Subtitle>Логин</Subtitle>
            <InputField value={login} onChange={setLogin} />
          </div>

          <div className={style['section__input']}>
            <Subtitle>Пароль</Subtitle>
            <InputField value={password} onChange={setPassword} />
          </div>

          <PrimaryButton type="submit">Войти</PrimaryButton>
        </form>
      </CenteredContainer>
    </FullscreenContainer>
  );
}
