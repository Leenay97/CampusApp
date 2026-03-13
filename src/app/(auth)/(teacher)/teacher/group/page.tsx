'use client';

import { useUser } from '@/contexts/UserContext';
import styles from './style.module.scss';
import { AddStudent } from '@/components/AddStudent/AddStudent';
import { useQuery } from '@apollo/client';
import queries from '@/graphql/queries';
import { List } from '@/components/List/List';
import { User } from '@/app/types';
import Section from '@/components/Section/Section';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Title from '@/components/Title/Title';

function TeacherGroupPage() {
  const { user } = useUser();
  const { data, loading, refetch } = useQuery(queries.GET_STUDENTS_BY_GROUP_ID, {
    variables: { groupId: user?.group?.id },
    skip: !user?.group?.id,
  });
  console.log(user);

  return (
    <CenteredContainer>
      <Section>
        <Title>Добавить студентов</Title>
        <div className="">
          Твоя группа <span className={styles['group-logo']}>{user?.group?.name}</span>
        </div>
        <AddStudent groupId={user?.group?.id} onAdd={refetch} />
        <List<User> items={data?.students} isLoading={loading} onDelete={() => {}} />
      </Section>
    </CenteredContainer>
  );
}

export default TeacherGroupPage;
