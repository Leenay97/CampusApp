import { Post as PostType } from '@/app/types';
import ReactMarkdown from 'react-markdown';
import styles from './Post.module.scss';

export default function Post({ post }: { post: PostType }) {
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
      <div className={styles['post__header']}>{post.title}</div>
      <div className={styles['post__body']}>
        <ReactMarkdown>{post.text}</ReactMarkdown>
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
