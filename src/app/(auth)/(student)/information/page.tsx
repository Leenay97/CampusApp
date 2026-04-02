'use client';

import { Post as PostType } from '@/app/types';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import CreatePostModal from '@/components/CreatePostModal/CreatePostModal';
import Loader from '@/components/Loader/Loaader';
import Post from '@/components/Post/Post';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import Section from '@/components/Section/Section';
import { useUser } from '@/contexts/UserContext';
import { GET_POSTS } from '@/graphql/queries/GetPosts';
import { useQuery } from '@apollo/client';
import { useState } from 'react';

export default function InfoPage() {
  const { user } = useUser();
  const [showCreator, setShowCreator] = useState(false);
  const { data, loading, refetch } = useQuery(GET_POSTS);

  if (loading)
    return (
      <CenteredContainer>
        <Section>
          <Loader />
        </Section>
      </CenteredContainer>
    );
  return (
    <CenteredContainer>
      {user?.userLevel !== 'STUDENT' && (
        <PrimaryButton onClick={() => setShowCreator(true)}>Добавить пост</PrimaryButton>
      )}
      {data?.posts?.map((post: PostType) => (
        <Post key={post?.id} post={post} />
      ))}
      <div className=""></div>
      {showCreator && <CreatePostModal onSubmit={refetch} onClose={() => setShowCreator(false)} />}
    </CenteredContainer>
  );
}
