import { Post as PostType } from '@/app/types';
import Section from '../Section/Section';
import Title from '../Title/Title';
import ReactMarkdown from 'react-markdown';
import styles from './Post.module.scss';

export default function Post({ post }: { post: PostType }) {
  return (
    <Section>
      <Title noMargin>{post.title}</Title>
      <div className={styles['posts__text']}>
        <ReactMarkdown>{post.text}</ReactMarkdown>
      </div>
    </Section>
  );
}
