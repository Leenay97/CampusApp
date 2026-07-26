'use client';

import { Post as PostType, UserLevel } from '@/app/types';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import CreatePostModal from '@/components/CreatePostModal/CreatePostModal';
import Loader from '@/components/Loader/Loaader';
import Post from '@/components/Post/Post';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import Section from '@/components/Section/Section';
import { useUser } from '@/contexts/UserContext';
import { DELETE_POST } from '@/graphql/mutations/DeletePost';
import { SEND_PUSH_ALL } from '@/graphql/mutations/SendPushAll';
import { GET_POSTS } from '@/graphql/queries/GetPosts';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { useQuery } from '@apollo/client';
import { useMemo, useState } from 'react';
import DOMPurify from 'dompurify';

export default function InfoPage() {
  const { user } = useUser();
  const isStaff = !!user && user.userLevel !== UserLevel.Student;
  const [showCreator, setShowCreator] = useState(false);
  const [editingPost, setEditingPost] = useState<PostType | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const { data, loading, refetch } = useQuery(GET_POSTS);
  const [sendPushToAll] = useGlobalLoadingMutation(SEND_PUSH_ALL);
  const [deletePost] = useGlobalLoadingMutation(DELETE_POST);

  const [createTitle, setCreateTitle] = useState<string>('');
  const [createText, setCreateText] = useState<string>('');
  const [editTitle, setEditTitle] = useState<string>('');
  const [editText, setEditText] = useState<string>('');

  function handleEditPost(post: PostType) {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditText(post.text);
  }

  async function handlePostCreated() {
    await refetch();

    try {
      // Текст поста — HTML из редактора; в уведомление идёт чистый текст
      const plainText = DOMPurify.sanitize(createText, { ALLOWED_TAGS: [] })
        .replace(/\s+/g, ' ')
        .trim();

      await sendPushToAll({
        title: `Новый пост от ${user?.name || 'Easy Campus'}`,
        body: plainText,
        url: '/information',
      });
    } catch (error) {
      console.error('❌ Ошибка push:', error);
    }

    setCreateTitle('');
    setCreateText('');
  }

  async function handleEditSubmit() {
    await refetch();
    setEditingPost(null);
    setEditTitle('');
    setEditText('');
  }

  async function handleDeleteRequest(id: string) {
    setDeletingPostId(id);
  }

  async function handleDeleteConfirm() {
    if (!deletingPostId) return;
    await deletePost({ id: deletingPostId });
    setDeletingPostId(null);
    refetch();
  }

  // Закреплённые посты идут первыми, внутри групп — по дате
  const sortedPosts = useMemo(() => {
    if (!data?.posts) return [];
    return [...data.posts].sort(
      (a, b) => Number(!!b.isPinned) - Number(!!a.isPinned) || b.createdAt - a.createdAt,
    );
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
      {isStaff && <PrimaryButton onClick={() => setShowCreator(true)}>Добавить пост</PrimaryButton>}

      {sortedPosts.map((post: PostType) => (
        <Post
          key={post.id}
          post={post}
          isEditable={isStaff}
          onEdit={handleEditPost}
          onDelete={handleDeleteRequest}
        />
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

      {deletingPostId && (
        <ConfirmModal
          title="Удалить пост"
          confirmText="Удалить"
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeletingPostId(null)}
        >
          Вы точно хотите удалить пост?
        </ConfirmModal>
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
