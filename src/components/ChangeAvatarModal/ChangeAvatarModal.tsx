'use client';

import { useLazyQuery } from '@apollo/client';
import { createPortal } from 'react-dom';
import { useCallback, useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';
import Title from '../Title/Title';
import styles from './ChangeAvatarModal.module.scss';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import SecondaryButton from '../SecondaryButton/SecondaryButton';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { GET_USER } from '@/graphql/queries/GetUser';
import { useUser } from '@/contexts/UserContext';
import { UPLOAD_AVATAR } from '@/graphql/mutations/UploadAvatar';

type CroppedAreaPixelsType = {
  x: number;
  y: number;
  width: number;
  height: number;
};

interface Props {
  userId?: string;
  photoUrl?: string;
  onSuccess?: (url: string) => void;
  onClose: () => void;
}

export function ChangeAvatarModal({ userId, photoUrl, onSuccess, onClose }: Props) {
  const [uploadAvatar, { loading }] = useGlobalLoadingMutation(UPLOAD_AVATAR);
  const [getUser] = useLazyQuery(GET_USER);
  const { setUser } = useUser();

  const [image, setImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixelsType | null>(null);

  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image);
    };
  }, [image]);

  const onCropComplete = useCallback((_, croppedPixels: CroppedAreaPixelsType) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  if (typeof window === 'undefined') return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('Файл не должен превышать 10MB');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
      alert('Поддерживаются только JPEG, PNG и WEBP');
      return;
    }

    setOriginalFile(selectedFile);
    const imageUrl = URL.createObjectURL(selectedFile);
    setImage(imageUrl);
  };

  const getCroppedBlob = async (): Promise<Blob> => {
    if (!image || !croppedAreaPixels) {
      throw new Error('No image or crop area');
    }

    const imageElement = new Image();
    imageElement.src = image;

    await new Promise((resolve, reject) => {
      imageElement.onload = resolve;
      imageElement.onerror = reject;
    });

    const canvas = document.createElement('canvas');
    const size = 300;

    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas context not available');
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    context.drawImage(
      imageElement,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      size,
      size,
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        },
        originalFile?.type || 'image/png',
        0.9,
      );
    });
  };

  const handleSaveAvatar = async () => {
    if (!originalFile || !userId) return;

    try {
      let fileToUpload = originalFile;

      if (image && croppedAreaPixels) {
        const croppedBlob = await getCroppedBlob();
        fileToUpload = new File([croppedBlob], originalFile.name, {
          type: originalFile.type,
        });
      }

      const data = await uploadAvatar({
        file: fileToUpload,
        userId: userId,
      });

      const updatedUser = await getUser({ variables: { id: userId } });

      setUser(updatedUser.data.user);

      if (data?.uploadAvatar?.photoUrl) {
        onSuccess?.(data.uploadAvatar.photoUrl);
        onClose();
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Ошибка при загрузке изображения');
    }
  };

  const handleCancelCrop = () => {
    setImage(null);
    setOriginalFile(null);
  };

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div className={styles.modal} onClick={handleOverlayClick}>
      <div className={styles.modal__content} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modal__header}>
          <Title>Сменить аватар</Title>
          <div className={styles['close-button']} onClick={onClose}>
            &times;
          </div>
        </div>

        <div className={styles.modal__body}>
          {!image ? (
            <>
              {photoUrl && (
                <img
                  src={`http://localhost:5000${photoUrl}`}
                  className={styles.image}
                  alt="Avatar"
                />
              )}
              <label className={styles.uploadButton}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  disabled={loading}
                  hidden
                />
              </label>
            </>
          ) : (
            <div className={styles.cropArea}>
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
          )}
        </div>

        {!image && (
          <div className={styles.modal__footer}>
            <PrimaryButton onClick={onClose} disabled={loading}>
              Отмена
            </PrimaryButton>
            <SecondaryButton onClick={handleSaveAvatar} disabled={loading || !originalFile}>
              {loading ? 'Загрузка...' : 'Загрузить'}
            </SecondaryButton>
          </div>
        )}

        {image && (
          <div className={styles.modal__footer}>
            <PrimaryButton onClick={handleCancelCrop} disabled={loading}>
              Отмена
            </PrimaryButton>
            <SecondaryButton onClick={handleSaveAvatar} disabled={loading}>
              {loading ? 'Загрузка...' : 'Сохранить'}
            </SecondaryButton>
          </div>
        )}
      </div>
    </div>,
    modalRoot,
  );
}
