import Image from 'next/image';
import styles from './style.module.scss';
import Coin from '@/assets/img/coin.png';
import { User } from '@/app/types';

type HeaderProfileProps = {
  user: User | null;
  isExpanded: boolean;
  onClick: () => void;
};

export function HeaderProfile({ user, isExpanded, onClick }: HeaderProfileProps) {
  return (
    <div className={styles['profile']} onClick={onClick}>
      {isExpanded && user && (
        <div className={styles['profile__info']}>
          <div className={styles['profile__name']}>{user.name}</div>
          <div className={styles['profile__balance']}>
            <Image src={Coin} alt="coins" /> {user.coins ?? 0}
          </div>
        </div>
      )}
      <div className={styles['profile__img']}>
        {user?.photoUrl && (
          <Image
            src={`http://localhost:5000${user?.photoUrl}` || ''}
            alt="Avatar"
            width={40}
            height={40}
            unoptimized
          />
        )}
      </div>
    </div>
  );
}
