import { Post as PostType } from '@/app/types';
import DOMPurify from 'dompurify';
import { useMutation } from '@apollo/client';
import { useEffect, useRef, useState } from 'react';
import styles from './Post.module.scss';
import EditButton from '../EditButton/EditButton';
import DeleteButton from '../DeleteButton/DeleteButton';
import { SET_POST_REACTION } from '@/graphql/mutations/SetPostReaction';

const REACTIONS = ['👍🏻', '🤣', '👹', '❤️', '🎉', '😭'];

type PostProps = {
  post: PostType;
  isEditable?: boolean;
  onEdit?: (post: PostType) => void;
  onDelete?: (id: string) => Promise<void>;
};

export default function Post({ post, isEditable = false, onEdit, onDelete }: PostProps) {
  const [setReaction] = useMutation(SET_POST_REACTION);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showPicker) return;
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker]);

  const formattedDate = new Date(Number(post.createdAt)).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  function handlePick(emoji: string) {
    handleReact(emoji);
    setShowPicker(false);
  }

  function handleReact(emoji: string) {
    const isRemoving = post.myReaction === emoji;
    const nextEmoji = isRemoving ? null : emoji;

    const counts = new Map((post.reactions ?? []).map((r) => [r.emoji, r.count]));
    if (post.myReaction) {
      const prevCount = (counts.get(post.myReaction) ?? 1) - 1;
      if (prevCount > 0) counts.set(post.myReaction, prevCount);
      else counts.delete(post.myReaction);
    }
    if (nextEmoji) {
      counts.set(nextEmoji, (counts.get(nextEmoji) ?? 0) + 1);
    }

    setReaction({
      variables: { postId: post.id, emoji },
      optimisticResponse: {
        setPostReaction: {
          __typename: 'Post',
          id: post.id,
          myReaction: nextEmoji,
          reactions: Array.from(counts, ([e, count]) => ({
            __typename: 'ReactionCount',
            emoji: e,
            count,
          })),
        },
      },
    });
  }

  return (
    <div className={styles['post']}>
      <div className={styles['post__header']}>
        {post.title}
        {isEditable && (
          <EditButton className={styles['post__edit']} onClick={() => onEdit?.(post)} />
        )}
        {isEditable && (
          <DeleteButton className={styles['post__delete']} onClick={() => onDelete?.(post.id)} />
        )}
      </div>
      <div
        className={styles['post__body']}
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(post.text),
        }}
      />
      <div className={styles['post__reactions']}>
        {REACTIONS.map((emoji) => {
          const count = post.reactions?.find((r) => r.emoji === emoji)?.count ?? 0;
          if (count === 0) return null;
          const isActive = post.myReaction === emoji;
          return (
            <button
              key={emoji}
              type="button"
              className={`${styles['post__reaction']} ${isActive ? styles['post__reaction--active'] : ''}`}
              onClick={() => handleReact(emoji)}
            >
              <span>{emoji}</span>
              <span className={styles['post__reaction-count']}>{count}</span>
            </button>
          );
        })}
        <div className={styles['post__reaction-picker-wrapper']} ref={pickerRef}>
          <button
            type="button"
            className={styles['post__reaction-add']}
            onClick={() => setShowPicker((v) => !v)}
          >
            +
          </button>
          {showPicker && (
            <div className={styles['post__reaction-picker']}>
              {REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className={styles['post__reaction-picker-item']}
                  onClick={() => handlePick(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className={styles['post__footer']}>
        {post.author?.photoUrl && (
          <div className={styles['post__author']}>
            <div className={styles['post__avatar']}>
              <div
                className={styles['image']}
                style={{
                  backgroundImage: post.author.photoUrl
                    ? `url(${process.env.NEXT_PUBLIC_API_URL}${post.author?.photoUrl})`
                    : 'none',
                }}
              />
            </div>
          </div>
        )}
        <div className={styles['post__date']}>{formattedDate}</div>
      </div>
    </div>
  );
}
