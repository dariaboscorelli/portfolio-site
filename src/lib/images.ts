import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { imageSize } from 'image-size';

const cache = new Map<string, number | undefined>();

/** Пропорция (ширина / высота) картинки из папки public, например '/images/uploads/x.webp'. */
export function ratioOf(src?: string): number | undefined {
  if (!src) return undefined;
  if (cache.has(src)) return cache.get(src);
  let ratio: number | undefined;
  const file = join(process.cwd(), 'public', decodeURI(src));
  if (existsSync(file)) {
    const { width, height } = imageSize(readFileSync(file));
    if (width && height) ratio = width / height;
  }
  cache.set(src, ratio);
  return ratio;
}

/** Текст с переносами строк из CMS → строки для вывода через <br>. */
export function lines(text?: string): string[] {
  return (text ?? '').replace(/\r\n/g, '\n').replace(/\n+$/, '').split('\n');
}

export const pad2 = (n: number) => String(n).padStart(2, '0');
