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

type ModalProps = {
  title: string;
  text: string;
  onTextChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

function CreatePostModal({
  title,
  text,
  onTextChange,
  onTitleChange,
  onClose,
  onSubmit,
}: ModalProps) {
  const [createPost] = useGlobalLoadingMutation(CREATE_POST);

  function handleClose() {
    onClose();
  }

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

  return (
    <Modal onClose={onClose} className={styles['modal-content']}>
      <ModalHeader title="Добавить пост" onClose={onClose} />

      <ModalBody>
        <InputField placeholder="Название" value={title} onChange={onTitleChange} />
        <SimpleMdeReact
          value={text}
          onChange={onTextChange}
          options={{
            spellChecker: false,
            placeholder: 'Текст',
            toolbar: ['bold', 'italic', 'heading', '|', 'unordered-list', 'ordered-list'],
          }}
        />
      </ModalBody>
      <ModalFooter>
        <SecondaryButton onClick={handleClose}>Отмена</SecondaryButton>
        <PrimaryButton onClick={handleSubmit}>Добавить</PrimaryButton>
      </ModalFooter>
    </Modal>
  );
}

export default memo(CreatePostModal);
