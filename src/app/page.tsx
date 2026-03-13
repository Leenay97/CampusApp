import { AuthGuard } from '@/auth/AuthGuard';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Header from '@/components/Header/Header';
import TeamRaiting from '@components/TeamRaiting/TeamRaiting';

export default function Home() {
  return (
    <AuthGuard>
      <CenteredContainer>
        <Header />
        <TeamRaiting />
      </CenteredContainer>
    </AuthGuard>
  );
}
