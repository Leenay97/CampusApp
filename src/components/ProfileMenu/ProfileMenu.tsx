import { JSX, memo, useMemo, useState } from 'react';
import styles from './ProfileMenu.module.scss';
import { useUser } from '@/contexts/UserContext';
import TransferCoinsModal from '../TransferCoinsModal/TransferCoinsModal';
import CoinHistoryModal from '../CoinHistoryModal/CoinHistoryModal';
import Coin from '@/assets/img/coin.png';
import Image from 'next/image';
import QRModal from '../QRModal/QRModal';
import FineStudentModal from '../FineStudentModal/FineStudentModal';
import { ChangeAvatarModal } from '../ChangeAvatarModal/ChangeAvatarModal';
import PushManager from '../PushManager/PushManager';
import { wsClient, client } from '@/lib/apollo';

type ProfileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

function ProfileMenu({ isOpen, onClose }: ProfileMenuProps): JSX.Element {
  const [transferModal, setTransferModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [myqr, setMyqr] = useState(false);
  const [fineModal, setFineModal] = useState(false);
  const [avatarModal, setAvatarModal] = useState(false);
  const { user, setUser } = useUser();

  async function handleLogout() {
    onClose();

    // Unsubscribe push *before* clearing the token, so the server-side
    // subscription record is actually removed and the push endpoint can't
    // deliver messages to the next user on this device.
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && 'serviceWorker' in navigator) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
      const pushCleanup = async () => {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          const endpoint = subscription.endpoint;
          await subscription.unsubscribe();
          // endpoint ограничивает отписку текущим устройством —
          // подписки на других устройствах пользователя остаются
          await fetch(`${apiUrl}/api/push/unsubscribe`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ endpoint }),
          });
        }
      };
      // 3-second timeout so a hanging serviceWorker.ready doesn't block logout.
      try {
        await Promise.race([pushCleanup(), new Promise((_, r) => setTimeout(r, 3000))]);
      } catch {
        // non-fatal — proceed with logout regardless
      }
    }

    // Dispose the WebSocket before navigating. iOS WKWebView can block navigation
    // completion when a WebSocket connection is open at the moment of redirect.
    try {
      await wsClient.dispose();
    } catch {
      // ignore
    }

    // Clear Apollo cache so stale data from this user isn't served to the next.
    await client.clearStore();

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  }

  function handleOpenTrabsferModal() {
    setTransferModal(true);
    onClose();
  }

  function handleOpenHistoryModal() {
    setHistoryModal(true);
    onClose();
  }

  function handleOpenQR() {
    setMyqr(true);
    onClose();
  }

  function handleOpenFineModal() {
    setFineModal(true);
    onClose();
  }

  function handleOpenAvatarModal() {
    setAvatarModal(true);
    onClose();
  }

  const role = useMemo(() => user?.userLevel, [user?.userLevel]);
  const lives = 3;
  const remainedLives = user?.lives ?? 3;
  const hearts = [...Array(remainedLives).fill('😻'), ...Array(lives - remainedLives).fill('😿')];

  return (
    <>
      <div className={isOpen ? styles['profile-menu'] : styles['profile-menu--hidden']}>
        <nav className={styles['profile-menu__wrapper']}>
          <div className={styles['profile-menu__user']}>
            <>
              {role === 'STUDENT' && (
                <div className={styles['profile-menu__rubbers']}>
                  {hearts.map((heart, index) => (
                    <div key={index}>{heart}</div>
                  ))}
                </div>
              )}
            </>
            <div className={styles['profile-menu__user-info']}>
              <div className={styles['profile-menu__user-name']}>{user?.name}</div>
              <div className={styles['profile-menu__user-coins']}>
                <Image src={Coin} alt="coins" /> {user?.coins ?? 0}
              </div>
            </div>
          </div>
          {(role === 'TEACHER' || role === 'ADMIN') && (
            <div className={styles['profile-menu__option']} onClick={handleOpenFineModal}>
              Оштрафовать
            </div>
          )}
          <div className={styles['profile-menu__option']} onClick={handleOpenTrabsferModal}>
            Перевести coins
          </div>
          <div className={styles['profile-menu__option']} onClick={handleOpenHistoryModal}>
            История coins
          </div>
          <div className={styles['profile-menu__option']} onClick={handleOpenQR}>
            Мой QR
          </div>
          <div className={styles['profile-menu__option']} onClick={handleOpenAvatarModal}>
            Сменить аватар
          </div>
          <PushManager />
          <div className={styles['profile-menu__option']} onClick={handleLogout}>
            Выйти
          </div>
        </nav>
      </div>
      {transferModal && (
        <TransferCoinsModal onClose={() => setTransferModal(false)}></TransferCoinsModal>
      )}
      {historyModal && user?.id && (
        <CoinHistoryModal studentId={user.id} onClose={() => setHistoryModal(false)} />
      )}
      {myqr && <QRModal onClose={() => setMyqr(false)}></QRModal>}
      {fineModal && <FineStudentModal onClose={() => setFineModal(false)}></FineStudentModal>}
      {avatarModal && (
        <ChangeAvatarModal
          onSuccess={() => setAvatarModal(false)}
          onClose={() => setAvatarModal(false)}
          userId={user?.id}
          photoUrl={user?.photoUrl}
        ></ChangeAvatarModal>
      )}
    </>
  );
}

export default memo(ProfileMenu);
