import { JSX, memo, useMemo, useState } from 'react';
import styles from './style.module.scss';
import { useUser } from '@/contexts/UserContext';
import TransferCoinsModal from '../TransferCoinsModal/TransferCoinsModal';
import Coin from '@/assets/img/coin.png';
import Image from 'next/image';
import QRModal from '../QRModal/QRModal';
import QRScannerModal from '../QRScannerModal/QRScannerModal';

type ProfileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

function ProfileMenu({ isOpen, onClose }: ProfileMenuProps): JSX.Element {
  const [transferModal, setTransferModal] = useState(false);
  const [myqr, setMyqr] = useState(false);
  const [qrScanner, setQrScanner] = useState(false);
  const { user, setUser } = useUser();

  function handleLogout() {
    onClose();
    setUser(null);
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  function handleOpenModal() {
    setTransferModal(true);
    onClose();
  }

  function handleOpenQR() {
    setMyqr(true);
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
              {' '}
              <div className={styles['profile-menu__user-name']}>{user?.name}</div>
              <div className={styles['profile-menu__user-coins']}>
                <Image src={Coin} alt="coins" /> {user?.coins ?? 0}
              </div>
            </div>
          </div>
          {(role === 'TEACHER' || role === 'ADMIN') && (
            <div className={styles['profile-menu__option']} onClick={() => setQrScanner(true)}>
              Оштрафовать
            </div>
          )}
          <div className={styles['profile-menu__option']} onClick={handleOpenModal}>
            Перевести coins
          </div>
          <div className={styles['profile-menu__option']} onClick={handleOpenQR}>
            Мой QR
          </div>
          <div className={styles['profile-menu__option']} onClick={handleLogout}>
            Выйти
          </div>
        </nav>
      </div>
      {transferModal && (
        <TransferCoinsModal onClose={() => setTransferModal(false)}></TransferCoinsModal>
      )}
      {myqr && <QRModal onClose={() => setMyqr(false)}></QRModal>}
      {qrScanner && (
        <QRScannerModal
          isOpen={qrScanner}
          type="FINE"
          onClose={() => setQrScanner(false)}
          onScanSuccess={(data) => console.log(data)}
        ></QRScannerModal>
      )}
    </>
  );
}

export default memo(ProfileMenu);
