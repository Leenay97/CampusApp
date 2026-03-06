'use client';

import { useUser } from '@/contexts/UserContext';
import styles from './style.module.scss';
import { AddStudent } from '@/components/AddStudent/AddStudent';
import { useQuery } from '@apollo/client';
import queries from '@/graphql/queries';
import { List } from '@/components/List/List';
import { User } from '@/app/types';

function TeacherGroupPage() {
  const { user } = useUser();
  const { data, loading, refetch } = useQuery(queries.GET_STUDENTS_BY_GROUP_ID, {
    variables: { groupId: user?.group?.id },
    skip: !user?.group?.id,
  });
  console.log(user);

  return (
    <div className="centered-container">
      <div className="section">
        <h1 className="title">Добавить студентов</h1>
        <div className="">
          Твоя группа <span className={styles['group-logo']}>{user?.group?.name}</span>
        </div>
        <AddStudent groupId={user?.group?.id} onAdd={refetch} />
        <List<User> items={data?.students} isLoading={loading} onDelete={() => {}} />
      </div>
    </div>
  );
}

export default TeacherGroupPage;
