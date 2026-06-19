import { Post as PostType } from '@/app/types';
import DOMPurify from 'dompurify';
import styles from './Post.module.scss';
import EditButton from '../EditButton/EditButton';
import DeleteButton from '../DeleteButton/DeleteButton';

type PostProps = {
  post: PostType;
  isEditable?: boolean;
  onEdit?: (post: PostType) => void;
  onDelete?: (id: string) => Promise<void>;
};

export default function Post({ post, isEditable = false, onEdit, onDelete }: PostProps) {
  const formattedDate = new Date(Number(post.createdAt)).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  console.log(post);

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
