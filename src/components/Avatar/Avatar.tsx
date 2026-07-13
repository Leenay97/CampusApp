'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './Avatar.module.scss';

type AvatarProps = {
  name?: string;
  photoUrl?: string | null;
  size?: number;
  className?: string;
};

export default function Avatar({ name, photoUrl, size = 40, className }: AvatarProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const showImage = Boolean(photoUrl) && photoUrl !== failedUrl;

  return (
    <div
      className={`${styles['avatar']} ${className ?? ''}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.45) }}
    >
      {showImage ? (
        <Image
          src={`${process.env.NEXT_PUBLIC_API_URL}${photoUrl}`}
          alt={name ?? 'Avatar'}
          width={size}
          height={size}
          unoptimized
          className={styles['avatar__image']}
          onError={() => setFailedUrl(photoUrl ?? null)}
        />
      ) : (
        <span>{name?.trim()[0]?.toUpperCase() ?? ''}</span>
      )}
    </div>
  );
}
