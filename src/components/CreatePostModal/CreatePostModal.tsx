'use client';
import { memo, useState, useEffect, ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import styles from './style.module.scss';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@components/SecondaryButton/SecondaryButton';
import { InputField } from '../InputField/InputField';
import Title from '../Title/Title';
import CenteredContainer from '../CenteredContainer/CenteredContainer';
import SimpleMdeReact from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { CREATE_POST } from '@/graphql/mutations/CreatePost';

type ModalProps = {
  onClose: () => void;
  onSubmit: () => void;
};

function CreatePostModal({ onClose, onSubmit }: ModalProps) {
  const [title, setTitle] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const [createPost] = useGlobalLoadingMutation(CREATE_POST);

  useEffect(() => {
    /*eslint-disable react-hooks/set-state-in-effect*/
    setMounted(true);
  }, []);

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  function handleClose() {
    onClose();
  }

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  async function handleSubmit() {
    try {
      await createPost({
        text,
        title,
      });
      onSubmit();
    } catch (error) {
      console.error('Error creating workshop:', error);
    }
  }

  return createPortal(
    <div className={styles['modal']}>
      <CenteredContainer wide>
        <div className={styles['modal__content']} onClick={handleContentClick}>
          <div className={styles['modal__header']}>
            <Title>Добавить пост</Title>
            <div className={styles['close-button']} onClick={onClose}>
              &times;
            </div>
          </div>
          <div className={styles['modal__body']}>
            <InputField placeholder="Название" value={title} onChange={setTitle} />
            <SimpleMdeReact
              value={text}
              onChange={setText}
              options={{
                spellChecker: false,
                placeholder: 'Текст',
                toolbar: ['bold', 'italic', 'heading', '|', 'unordered-list', 'ordered-list'],
              }}
            />
          </div>
          <div className={styles['modal__footer']}>
            <SecondaryButton onClick={handleClose}>Отмена</SecondaryButton>
            <PrimaryButton onClick={handleSubmit}>Добавить</PrimaryButton>
          </div>
        </div>
      </CenteredContainer>
    </div>,
    modalRoot,
  );
}

export default memo(CreatePostModal);
