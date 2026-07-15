import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import path from 'path';

// Стикерпаки — просто папки с картинками в public/stickers/<pack>/*.png,
// которые кладутся на сервер вручную. Никакого UI или API для загрузки
// стикерпаков нет и быть не должно — только чтение того, что уже на диске.
export const dynamic = 'force-dynamic';

const IMAGE_EXTENSIONS = new Set(['.png', '.webp', '.jpg', '.jpeg', '.gif']);
const STICKERS_DIR = path.join(process.cwd(), 'public', 'stickers');

export type StickerPack = {
  name: string;
  stickers: string[];
};

export async function GET() {
  let packEntries;
  try {
    packEntries = await readdir(STICKERS_DIR, { withFileTypes: true });
  } catch {
    return NextResponse.json({ packs: [] });
  }

  const packNames = packEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const packs: StickerPack[] = await Promise.all(
    packNames.map(async (packName) => {
      let fileEntries;
      try {
        fileEntries = await readdir(path.join(STICKERS_DIR, packName), { withFileTypes: true });
      } catch {
        return { name: packName, stickers: [] };
      }

      const stickers = fileEntries
        .filter(
          (entry) => entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()),
        )
        .map((entry) => `/stickers/${packName}/${entry.name}`)
        .sort();

      return { name: packName, stickers };
    }),
  );

  return NextResponse.json({ packs: packs.filter((pack) => pack.stickers.length > 0) });
}
