'use client';
import { useState } from 'react';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Section from '@/components/Section/Section';
import Title from '@/components/Title/Title';
import { InputField } from '@/components/InputField/InputField';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import { SEND_PUSH_ALL } from '@/graphql/mutations/SendPushAll';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';

export default function AdminPushPage() {
  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [sendPushAll] = useGlobalLoadingMutation(SEND_PUSH_ALL);

  async function handleSend() {
    try {
      await sendPushAll({ title: title.trim(), body: body.trim(), url: '/' });
      setTitle('');
      setBody('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsConfirmOpen(false);
    }
  }

  return (
    <CenteredContainer noPaddingTop>
      <Section>
        <Title noMargin>Пушка</Title>
        <InputField value={title} onChange={setTitle} maxLength={100} placeholder="Заголовок" />
        <InputField value={body} onChange={setBody} maxLength={300} placeholder="Текст" />
        <PrimaryButton
          onClick={() => setIsConfirmOpen(true)}
          disabled={!title.trim() || !body.trim()}
        >
          Отправить всем
        </PrimaryButton>
      </Section>
      {isConfirmOpen && (
        <ConfirmModal
          title="Отправить уведомление всем?"
          confirmText="Отправить"
          onConfirm={handleSend}
          onClose={() => setIsConfirmOpen(false)}
        >
          «{title}» — {body}
          <br />
          Уйдёт всем подписанным пользователям сразу, отменить будет нельзя.
        </ConfirmModal>
      )}
    </CenteredContainer>
  );
}
