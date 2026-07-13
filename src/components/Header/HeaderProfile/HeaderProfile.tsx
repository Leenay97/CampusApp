import styles from './HeaderProfile.module.scss';
import { User } from '@/app/types';
import Avatar from '@/components/Avatar/Avatar';

type HeaderProfileProps = {
  user: User | null;
  onClick: () => void;
};

export function HeaderProfile({ user, onClick }: HeaderProfileProps) {
  return (
    <div className={styles['profile']} onClick={onClick}>
      <Avatar name={user?.name} photoUrl={user?.photoUrl} size={40} />
    </div>
  );
}
