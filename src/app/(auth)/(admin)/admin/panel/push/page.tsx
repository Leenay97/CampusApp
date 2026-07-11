'use client';
import { useState } from 'react';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Section from '@/components/Section/Section';
import Title from '@/components/Title/Title';
import Subtitle from '@/components/Subtitle/Subtitle';
import { InputField } from '@/components/InputField/InputField';
import SwitchSelector from '@/components/SwitchSelector/SwitchSelector';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import { SEND_PUSH_ALL } from '@/graphql/mutations/SendPushAll';
import { SEND_PUSH_STAFF } from '@/graphql/mutations/SendPushStaff';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';

const AUDIENCE_ALL = 'Все';
const AUDIENCE_TEACHERS = 'Учителя';

export default function PushPage() {
  const [audience, setAudience] = useState<string>(AUDIENCE_ALL);
  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');

  const [sendPushAll] = useGlobalLoadingMutation(SEND_PUSH_ALL);
  const [sendPushStaff] = useGlobalLoadingMutation(SEND_PUSH_STAFF);

  async function handleSend() {
    const variables = { title: title.trim(), body: body.trim(), url: '/' };
    try {
      if (audience === AUDIENCE_ALL) {
        await sendPushAll(variables);
      } else {
        await sendPushStaff(variables);
      }
      setTitle('');
      setBody('');
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <CenteredContainer noPadding>
      <Section>
        <Title>Пуш-уведомления</Title>
        <div>
          <Subtitle>Кому</Subtitle>
          <SwitchSelector
            value={audience}
            values={[AUDIENCE_ALL, AUDIENCE_TEACHERS]}
            onChange={setAudience}
          />
        </div>
        <InputField label="Заголовок" value={title} onChange={setTitle} maxLength={100} />
        <InputField label="Текст" value={body} onChange={setBody} maxLength={300} />
        <PrimaryButton onClick={handleSend} disabled={!title.trim() || !body.trim()}>
          Отправить
        </PrimaryButton>
      </Section>
    </CenteredContainer>
  );
}
