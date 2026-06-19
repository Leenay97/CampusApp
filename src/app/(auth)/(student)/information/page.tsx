'use client';

import { Post as PostType } from '@/app/types';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import CreatePostModal from '@/components/CreatePostModal/CreatePostModal';
import Loader from '@/components/Loader/Loaader';
import Post from '@/components/Post/Post';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import Section from '@/components/Section/Section';
import { useUser } from '@/contexts/UserContext';
import { SEND_PUSH_ALL } from '@/graphql/mutations/SendPushAll';
import { GET_POSTS } from '@/graphql/queries/GetPosts';
import { useQuery, useMutation } from '@apollo/client';
import { useMemo, useState } from 'react';

export default function InfoPage() {
  const { user } = useUser();
  const [showCreator, setShowCreator] = useState(false);
  const [editingPost, setEditingPost] = useState<PostType | null>(null);
  const { data, loading, refetch } = useQuery(GET_POSTS);
  const [sendPushToAll] = useMutation(SEND_PUSH_ALL);

  const [createTitle, setCreateTitle] = useState<string>('');
  const [createText, setCreateText] = useState<string>('');
  const [editTitle, setEditTitle] = useState<string>('');
  const [editText, setEditText] = useState<string>('');

  const handleEditPost = (post: PostType) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditText(post.text);
  };

  const handlePostCreated = async () => {
    await refetch();

    try {
      await sendPushToAll({
        variables: {
          title: `Новый пост от ${user?.name || 'Easy Campus'}`,
          body: createText,
          url: '/information',
        },
      });
    } catch (error) {
      console.error('❌ Ошибка push:', error);
    }

    setCreateTitle('');
    setCreateText('');
  };

  async function handleEditSubmit() {
    await refetch();
    setEditingPost(null);
    setEditTitle('');
    setEditText('');
  }

  const sortedPosts = useMemo(() => {
    if (!data?.posts) return [];
    return [...data.posts].sort((a, b) => b.createdAt - a.createdAt);
  }, [data]);

  if (loading) {
    return (
      <CenteredContainer>
        <Section>
          <Loader />
        </Section>
      </CenteredContainer>
    );
  }

  return (
    <CenteredContainer>
      {user?.userLevel !== 'STUDENT' && (
        <PrimaryButton onClick={() => setShowCreator(true)}>Добавить пост</PrimaryButton>
      )}

      {sortedPosts.map((post: PostType) => (
        <Post key={post.id} post={post} onEdit={handleEditPost} />
      ))}

      {showCreator && (
        <CreatePostModal
          title={createTitle}
          text={createText}
          userId={user?.id ?? ''}
          onTextChange={setCreateText}
          onTitleChange={setCreateTitle}
          onSubmit={handlePostCreated}
          onClose={() => {
            setShowCreator(false);
            setCreateTitle('');
            setCreateText('');
          }}
        />
      )}

      {editingPost && (
        <CreatePostModal
          editMode
          postId={editingPost.id}
          userId={user?.id ?? ''}
          title={editTitle}
          text={editText}
          onTextChange={setEditText}
          onTitleChange={setEditTitle}
          onSubmit={handleEditSubmit}
          onClose={() => {
            setEditingPost(null);
            setEditTitle('');
            setEditText('');
          }}
        />
      )}
    </CenteredContainer>
  );
}
