'use client';

import { usePathname } from 'next/navigation';
import styles from './ChatButton.module.scss';

export default function ChatButton() {
  const pathname = usePathname();

  if (pathname === '/chat') {
    return null;
  }

  function handleOpenChat() {
    window.location.href = '/chat';
  }

  return (
    <div className={styles['chat-button']} onClick={handleOpenChat}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    </div>
  );
}
