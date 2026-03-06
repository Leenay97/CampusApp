'use client';

import { useUser } from '@/contexts/UserContext';
import { QRCodeCanvas } from 'qrcode.react';

function TeacherGroupPage() {
  const { user } = useUser();

  const groupUrl = `${window.location.origin}/register?token=${user?.group?.id}`;

  return (
    <div className="fullscreen-container">
      <div className="section">
        {user?.group?.id && <QRCodeCanvas value={groupUrl} size={200} />}
      </div>
    </div>
  );
}

export default TeacherGroupPage;
