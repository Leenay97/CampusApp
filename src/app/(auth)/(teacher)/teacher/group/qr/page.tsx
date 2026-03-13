'use client';

import FullscreenContainer from '@/components/FullscreenContainer/FullscreenContainer';
import Section from '@/components/Section/Section';
import { useUser } from '@/contexts/UserContext';
import { QRCodeCanvas } from 'qrcode.react';

function TeacherGroupPage() {
  const { user } = useUser();

  const groupUrl = `${window.location.origin}/register?token=${user?.group?.id}`;

  return (
    <FullscreenContainer>
      <Section>{user?.group?.id && <QRCodeCanvas value={groupUrl} size={200} />}</Section>
    </FullscreenContainer>
  );
}

export default TeacherGroupPage;
