'use client';
import { memo } from 'react';
import styles from './CreatePostModal.module.scss';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@components/SecondaryButton/SecondaryButton';
import { InputField } from '../InputField/InputField';
import SimpleMdeReact from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { CREATE_POST } from '@/graphql/mutations/CreatePost';
import Modal from '../Modal/Modal';
import ModalHeader from '../Modal/ModalHeader';
import ModalBody from '../Modal/ModalBody';
import ModalFooter from '../Modal/ModalFooter';
import { UPDATE_POST } from '@/graphql/mutations/UpdatePost';

type ModalProps = {
  title: string;
  text: string;
  userId?: string;
  editMode?: boolean;
  postId?: string;
  onTextChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

function CreatePostModal({
  title,
  text,
  userId,
  editMode = false,
  postId,
  onTextChange,
  onTitleChange,
  onClose,
  onSubmit,
}: ModalProps) {
  const [createPost] = useGlobalLoadingMutation(CREATE_POST);
  const [updatePost] = useGlobalLoadingMutation(UPDATE_POST);

  async function handleSubmit() {
    if (editMode) {
      try {
        await updatePost({
          id: postId,
          title,
          text,
        });
        onSubmit();
        onClose();
      } catch (error) {
        console.error('Ошибка редактирования:', error);
      }
      return;
    }

    try {
      await createPost({
        text,
        title,
        authorId: userId,
      });
      onSubmit();
      onClose();
    } catch (error) {
      console.error('Ошибка создания поста:', error);
    }
  }

  return (
    <Modal onClose={onClose} className={styles['modal-content']}>
      <ModalHeader title={editMode ? 'Редактировать пост' : 'Добавить пост'} onClose={onClose} />
      <ModalBody>
        <InputField placeholder="Название" value={title} onChange={onTitleChange} />
        <SimpleMdeReact
          value={text}
          onChange={onTextChange}
          options={{
            spellChecker: false,
            placeholder: 'Текст',
            toolbar: ['bold', 'italic'],
          }}
        />
      </ModalBody>
      <ModalFooter>
        <SecondaryButton onClick={onClose}>Отмена</SecondaryButton>
        <PrimaryButton onClick={handleSubmit}>{editMode ? 'Сохранить' : 'Добавить'}</PrimaryButton>
      </ModalFooter>
    </Modal>
  );
}

export default memo(CreatePostModal);
