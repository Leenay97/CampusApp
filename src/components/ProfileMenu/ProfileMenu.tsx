import { JSX, memo, useState } from 'react';
import styles from './style.module.scss';
import { useUser } from '@/contexts/UserContext';
import TransferCoinsModal from '../TransferCoinsModal/TransferCoinsModal';

type ProfileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

function ProfileMenu({ isOpen, onClose }: ProfileMenuProps): JSX.Element {
  const [transferModal, setTransferModal] = useState(false);
  const { setUser } = useUser();
  function handleLogout() {
    onClose();
    setUser(null);
    localStorage.removeItem('token');
  }

  function handleOpenModal() {
    setTransferModal(true);
    onClose();
  }

  return (
    <>
      <div className={isOpen ? styles['profile-menu'] : styles['profile-menu--hidden']}>
        <nav className={styles['profile-menu__wrapper']}>
          <div className={styles['profile-menu__option']} onClick={handleOpenModal}>
            Перевести coins
          </div>
          <div className={styles['profile-menu__option']} onClick={handleLogout}>
            Выйти
          </div>
        </nav>
      </div>
      {transferModal && (
        <TransferCoinsModal onClose={() => setTransferModal(false)}></TransferCoinsModal>
      )}
    </>
  );
}

export default memo(ProfileMenu);
