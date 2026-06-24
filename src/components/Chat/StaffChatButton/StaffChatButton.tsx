'use client';

import { usePathname } from 'next/navigation';
import styles from './StaffChatButton.module.scss';

export default function StaffChatButton() {
  const pathname = usePathname();

  if (pathname === '/chat' || pathname === '/staff-chat') {
    return null;
  }

  function handleOpenChat() {
    window.location.href = '/staff-chat';
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
        <rect x="3" y="4" width="18" height="12" rx="2"></rect>

        <path d="M8 20h8"></path>
        <path d="M12 16v4"></path>

        <path d="M7 8h10"></path>
        <path d="M7 12h6"></path>
      </svg>
    </div>
  );
}
