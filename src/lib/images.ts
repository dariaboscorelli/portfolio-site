import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { imageSize } from 'image-size';

const cache = new Map<string, number | undefined>();

/** Пропорция видео MP4/MOV: размеры дорожки из атома tkhd (с учётом поворота у роликов с телефона). */
function videoRatio(buf: Buffer): number | undefined {
  let i = buf.indexOf('tkhd');
  while (i !== -1 && i + 100 < buf.length) {
    const version = buf[i + 4];
    const matrix = i + 8 + (version === 1 ? 32 : 20) + 16;
    const w = buf.readUInt32BE(matrix + 36) / 65536;
    const h = buf.readUInt32BE(matrix + 40) / 65536;
    if (w > 0 && h > 0) {
      const b = buf.readInt32BE(matrix + 4); // ненулевой — поворот на 90°/270°
      return b !== 0 ? h / w : w / h;
    }
    i = buf.indexOf('tkhd', i + 4);
  }
  return undefined;
}

/** Пропорция (ширина / высота) картинки или видео из папки public, например '/images/uploads/x.webp'. */
export function ratioOf(src?: string): number | undefined {
  if (!src) return undefined;
  if (cache.has(src)) return cache.get(src);
  let ratio: number | undefined;
  const file = join(process.cwd(), 'public', decodeURI(src));
  if (existsSync(file)) {
    try {
      const buf = readFileSync(file);
      if (/\.(mp4|m4v|mov)$/i.test(src)) {
        ratio = videoRatio(buf);
      } else {
        const { width, height } = imageSize(buf);
        if (width && height) ratio = width / height;
      }
    } catch {
      ratio = undefined;
    }
  }
  cache.set(src, ratio);
  return ratio;
}

/** Текст с переносами строк из CMS → строки для вывода через <br>. */
export function lines(text?: string): string[] {
  return (text ?? '').replace(/\r\n/g, '\n').replace(/\n+$/, '').split('\n');
}

export const pad2 = (n: number) => String(n).padStart(2, '0');
