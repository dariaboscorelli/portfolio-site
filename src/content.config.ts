import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORY_IDS } from './lib/categories';

// Админка может сохранить пустое поле как "" или null — считаем это «не заполнено».
const empty = (v: unknown) => (v === '' || v === null ? undefined : v);
const optText = z.preprocess(empty, z.string().optional()).transform((v) => v ?? '');
const optPath = z.preprocess(empty, z.string().optional());
const optNumber = z.preprocess(empty, z.coerce.number().optional());

// Картинка внутри кейса. Пропорции берутся из самого файла, поэтому их не нужно указывать.
// Вместо картинки можно загрузить видео (video): оно играет само, без звука, по кругу.
const picture = z.object({ src: optPath, video: optPath, alt: optText });

// Блоки, из которых собирается раздел кейса
const mediaBlock = z.discriminatedUnion('type', [
  // одна картинка или видео на всю ширину
  z.object({ type: z.literal('image'), src: optPath, video: optPath, alt: optText }),
  // ряд картинок одинаковой высоты
  z.object({
    type: z.literal('row'),
    gap: optNumber.transform((v) => v ?? 16),
    images: z.preprocess(empty, z.array(picture).optional()).transform((v) => v ?? []),
  }),
  // тёмная плашка-подпись
  z.object({ type: z.literal('caption'), text: optText }),
]);

const section = z.object({
  label: z.string(), // «ЗАДАЧА», «МОЯ РОЛЬ», «РЕЗУЛЬТАТ»…
  text: optText,
  width: optNumber, // ширина абзаца в px, как в макете (необязательно)
  media: z.preprocess(empty, z.array(mediaBlock).optional()).transform((v) => v ?? []),
});

const cases = defineCollection({
  // каждый кейс — отдельный файл src/content/cases/<адрес-страницы>.yml
  loader: glob({
    pattern: '**/*.{yml,yaml}',
    base: './src/content/cases',
    // адрес страницы = имя файла (админка называет файл по полю «Адрес страницы»)
    generateId: ({ entry }) => entry.replace(/\.(yml|yaml)$/, ''),
  }),
  schema: z.object({
    // --- плитка на главной ---
    title: z.string(),
    tag: optText, // красная подпись над названием
    category: z.enum(CATEGORY_IDS), // для фильтра
    summary: optText, // строка под названием
    order: z.coerce.number(), // порядок на главной: 1, 2, 3… (нечётные — левая колонка, чётные — правая)
    cover: optPath,
    coverVideo: optPath, // короткий ролик, который играет при наведении на плитку
    coverHeight: optNumber.transform((v) => v ?? 400), // высота обложки при ширине плитки 468 px
    showOnHome: z.preprocess(empty, z.boolean().optional()).transform((v) => v ?? true),
    // --- страница кейса ---
    lead: optText,
    client: optText,
    role: optText,
    tools: optText,
    hero: optPath,
    heroVideo: optPath, // видео вместо главной картинки кейса
    sections: z.preprocess(empty, z.array(section).optional()).transform((v) => v ?? []),
  }),
});

export const collections = { cases };
