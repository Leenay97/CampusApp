'use client';

import { useState } from 'react';
import FullscreenContainer from '@/components/FullscreenContainer/FullscreenContainer';
import Section from '@/components/Section/Section';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import { useUser } from '@/contexts/UserContext';
import { QRCodeCanvas } from 'qrcode.react';
import styles from './GroupQrPage.module.scss';

function TeacherGroupPage() {
  const { user } = useUser();
  const [copied, setCopied] = useState(false);

  const groupUrl = `${window.location.origin}/register?token=${user?.group?.id}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(groupUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <FullscreenContainer>
      <Section>
        <div className={styles['group-qr']}>
          {user?.group?.id && (
            <>
              <QRCodeCanvas value={groupUrl} size={200} />
              <div className={styles['group-qr__link-row']}>
                <div className={styles['group-qr__link']}>{groupUrl}</div>
                <PrimaryButton onClick={handleCopy}>
                  {copied ? 'Скопировано' : 'Скопировать'}
                </PrimaryButton>
              </div>
            </>
          )}
        </div>
      </Section>
    </FullscreenContainer>
  );
}

export default TeacherGroupPage;
