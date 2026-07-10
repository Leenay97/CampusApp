'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { QRCodeCanvas } from 'qrcode.react';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Section from '@/components/Section/Section';
import Title from '@/components/Title/Title';
import { InputField } from '@/components/InputField/InputField';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import Modal from '@/components/Modal/Modal';
import ModalHeader from '@/components/Modal/ModalHeader';
import ModalBody from '@/components/Modal/ModalBody';
import Loader from '@/components/Loader/Loaader';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import queries from '@/graphql/queries';
import mutations from '@/graphql/mutations';
import { User } from '@/app/types';
import styles from './PasswordResetPage.module.scss';

type GeneratePasswordResetLinkResponse = {
  generatePasswordResetLink: string;
};

export default function PasswordResetPage() {
  const [search, setSearch] = useState('');
  const [links, setLinks] = useState<Record<string, string>>({});
  const [qrStudentId, setQrStudentId] = useState<string | null>(null);
  const [copiedStudentId, setCopiedStudentId] = useState<string | null>(null);
  const { data, loading } = useQuery(queries.GET_ALL_STUDENTS);
  const [generateLink] = useGlobalLoadingMutation<
    GeneratePasswordResetLinkResponse,
    { userId: string }
  >(mutations.GENERATE_PASSWORD_RESET_LINK);

  const filteredStudents: User[] = useMemo(() => {
    const students: User[] = data?.students || [];
    if (!search.trim()) return students;

    const query = search.toLowerCase();
    return students.filter(
      (student) =>
        student.name?.toLowerCase().includes(query) ||
        student.russianName?.toLowerCase().includes(query) ||
        student.login?.toLowerCase().includes(query),
    );
  }, [data, search]);

  async function generateResetLink(studentId: string): Promise<string> {
    const result = await generateLink({ userId: studentId });
    const resetLink = `${window.location.origin}/reset-password?token=${result.generatePasswordResetLink}`;
    setLinks((prev) => ({ ...prev, [studentId]: resetLink }));
    return resetLink;
  }

  async function handleShowQr(studentId: string) {
    if (!links[studentId]) {
      await generateResetLink(studentId);
    }
    setQrStudentId(studentId);
  }

  async function handleCopyLink(studentId: string) {
    const link = links[studentId] || (await generateResetLink(studentId));
    await navigator.clipboard.writeText(link);
    setCopiedStudentId(studentId);
    setTimeout(() => {
      setCopiedStudentId((prev) => (prev === studentId ? null : prev));
    }, 3000);
  }

  if (loading) {
    return (
      <CenteredContainer>
        <Section>
          <Loader />
        </Section>
      </CenteredContainer>
    );
  }

  return (
    <CenteredContainer>
      <Section>
        <Title>Восстановление пароля</Title>
        <div className={styles['row']}>
          <InputField
            value={search}
            onChange={setSearch}
            width="240px"
            placeholder="Имя или логин"
          />
        </div>

        <div className={styles['list']}>
          {filteredStudents.length === 0 && (
            <div className={styles['empty']}>Никого не нашлось</div>
          )}
          {filteredStudents.map((student) => (
            <div key={student.id} className={styles['list__row']}>
              <div className={styles['list__info']}>
                <div>{student.name || student.russianName || '—'}</div>
                <div className={styles['list__meta']}>
                  {student.login ? `Логин: ${student.login}` : 'Не зарегистрирован'}
                </div>
                {student.group?.name ? (
                  <div className={styles['list__group']}>Группа: {student.group.name}</div>
                ) : (
                  <div className={styles['list__meta']}>Без группы</div>
                )}
              </div>

              <div className={styles['list__actions']}>
                <PrimaryButton onClick={() => handleCopyLink(student.id)}>
                  {copiedStudentId === student.id ? 'Скопировано' : 'Ссылка'}
                </PrimaryButton>
                <PrimaryButton onClick={() => handleShowQr(student.id)}>QR</PrimaryButton>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {qrStudentId && links[qrStudentId] && (
        <Modal onClose={() => setQrStudentId(null)}>
          <ModalHeader title="QR для смены пароля" onClose={() => setQrStudentId(null)} />
          <ModalBody>
            <QRCodeCanvas value={links[qrStudentId]} size={200} />
          </ModalBody>
        </Modal>
      )}
    </CenteredContainer>
  );
}
