'use client';

import { useEffect } from 'react';

export default function Error({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    if (error.message.includes('Failed to find Server Action')) {
      window.location.reload();
    }
  }, [error]);

  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <p>Обновляем приложение…</p>
    </div>
  );
}
