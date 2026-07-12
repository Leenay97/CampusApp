'use client';
import { memo, useRef } from 'react';
import { useMutation } from '@apollo/client';
import styles from './CreatePostModal.module.scss';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@components/SecondaryButton/SecondaryButton';
import { InputField } from '../InputField/InputField';
import 'easymde/dist/easymde.min.css';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { CREATE_POST } from '@/graphql/mutations/CreatePost';
import Modal from '../Modal/Modal';
import ModalHeader from '../Modal/ModalHeader';
import ModalBody from '../Modal/ModalBody';
import ModalFooter from '../Modal/ModalFooter';
import { UPDATE_POST } from '@/graphql/mutations/UpdatePost';
import { DELETE_POST_IMAGE } from '@/graphql/mutations/DeletePostImage';
import TiptapEditor from '../TiptapEditor/TiptapEditor';

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
  // Без глобального лоадера: чистка файлов должна проходить незаметно
  const [deletePostImage] = useMutation(DELETE_POST_IMAGE);

  // Картинки, загруженные за эту сессию редактирования
  const uploadedImagesRef = useRef<string[]>([]);

  function handleImageUpload(url: string) {
    uploadedImagesRef.current.push(url);
  }

  function cleanupImages(urls: string[]) {
    urls.forEach((url) => {
      deletePostImage({ variables: { url } }).catch((error) =>
        console.error('Ошибка удаления картинки:', error),
      );
    });
    uploadedImagesRef.current = [];
  }

  function handleClose() {
    // Пост не сохранён — все загруженные в этой сессии картинки не нужны
    cleanupImages(uploadedImagesRef.current);
    onClose();
  }

  async function handleSubmit() {
    if (editMode) {
      try {
        await updatePost({
          id: postId,
          title,
          text,
        });
        cleanupImages(uploadedImagesRef.current.filter((url) => !text.includes(url)));
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
      cleanupImages(uploadedImagesRef.current.filter((url) => !text.includes(url)));
      onSubmit();
      onClose();
    } catch (error) {
      console.error('Ошибка создания поста:', error);
    }
  }

  return (
    <Modal onClose={handleClose} className={styles['modal-content']}>
      <ModalHeader
        title={editMode ? 'Редактировать пост' : 'Добавить пост'}
        onClose={handleClose}
      />
      <ModalBody>
        <InputField placeholder="Название" value={title} onChange={onTitleChange} />
        <TiptapEditor value={text} onChange={onTextChange} onImageUpload={handleImageUpload} />
      </ModalBody>
      <ModalFooter>
        <SecondaryButton onClick={handleClose}>Отмена</SecondaryButton>
        <PrimaryButton onClick={handleSubmit}>{editMode ? 'Сохранить' : 'Добавить'}</PrimaryButton>
      </ModalFooter>
    </Modal>
  );
}

export default memo(CreatePostModal);
