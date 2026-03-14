import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Section from '@/components/Section/Section';
import Title from '@/components/Title/Title';
import { AdminPanelOptions } from './constants';
import Link from 'next/link';
import styles from './Panel.module.scss';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <CenteredContainer wide>
      <Section>
        <Title>Admin panel</Title>
        <div className={styles['admin-panel']}>
          {AdminPanelOptions.map((item) => (
            <Link key={item.link} href={item.link} className={styles['admin-panel__option']}>
              {item.name}
            </Link>
          ))}
        </div>
      </Section>
      {children}
    </CenteredContainer>
  );
}
