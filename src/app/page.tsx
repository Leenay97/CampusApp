import { AuthGuard } from '@/auth/AuthGuard';
import Header from '@/components/Header/Header';
import TeamRaiting from '@components/TeamRaiting/TeamRaiting';

export default function Home() {
  return (
    <AuthGuard>
      <div className="centered-container">
        <Header />
        <TeamRaiting />
      </div>
    </AuthGuard>
  );
}
