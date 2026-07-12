import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Section from '@/components/Section/Section';
import Title from '@/components/Title/Title';
import PanelMenu from './PanelMenu';
import { ReactNode } from 'react';

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <CenteredContainer wide>
      <Section>
        <Title noMargin>Admin panel</Title>
        <PanelMenu />
      </Section>
      {children}
    </CenteredContainer>
  );
}
