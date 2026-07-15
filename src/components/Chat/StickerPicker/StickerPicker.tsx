'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './StickerPicker.module.scss';

type StickerPack = {
  name: string;
  stickers: string[];
};

type StickerPickerProps = {
  onSelect: (stickerUrl: string) => void;
  onClose: () => void;
};

export default function StickerPicker({ onSelect, onClose }: StickerPickerProps) {
  const [packs, setPacks] = useState<StickerPack[] | null>(null);
  const [activePack, setActivePack] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/stickers')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setPacks(data.packs ?? []);
      })
      .catch(() => {
        if (!cancelled) setPacks([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const currentPack = packs?.[activePack];

  return (
    <div className={styles['sticker-picker']} ref={rootRef}>
      {packs === null && <div className={styles['sticker-picker__empty']}>Загрузка...</div>}

      {packs !== null && packs.length === 0 && (
        <div className={styles['sticker-picker__empty']}>Стикерпаков пока нет</div>
      )}

      {packs !== null && packs.length > 0 && (
        <>
          {packs.length > 1 && (
            <div className={styles['sticker-picker__tabs']}>
              {packs.map((pack, index) => (
                <button
                  key={pack.name}
                  className={`${styles['sticker-picker__tab']} ${
                    index === activePack ? styles['sticker-picker__tab_active'] : ''
                  }`}
                  onClick={() => setActivePack(index)}
                  title={pack.name}
                >
                  <Image
                    src={pack.stickers[0]}
                    alt={pack.name}
                    width={28}
                    height={28}
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
          <div className={styles['sticker-picker__grid']}>
            {currentPack?.stickers.map((stickerUrl) => (
              <button
                key={stickerUrl}
                className={styles['sticker-picker__sticker']}
                onClick={() => onSelect(stickerUrl)}
              >
                <Image src={stickerUrl} alt="" width={64} height={64} unoptimized />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
