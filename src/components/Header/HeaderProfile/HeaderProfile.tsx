import Image from 'next/image';
import styles from './HeaderProfile.module.scss';
import { User } from '@/app/types';

type HeaderProfileProps = {
  user: User | null;
  onClick: () => void;
};

export function HeaderProfile({ user, onClick }: HeaderProfileProps) {
  return (
    <div className={styles['profile']} onClick={onClick}>
      <div className={styles['profile__img']}>
        {user?.photoUrl && (
          <Image
            src={`${process.env.NEXT_PUBLIC_API_URL}${user?.photoUrl}`}
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
