// Направления для фильтра на главной (порядок — как в макете)
export const CATEGORIES = [
  { id: 'esports', title: 'Киберспорт и трансляции' },
  { id: 'branding', title: 'Брендинг и упаковка' },
  { id: 'ads', title: 'Реклама и SMM' },
  { id: 'special', title: 'Спецпроекты и веб' },
  { id: 'ai', title: 'ИИ-генерации' },
  { id: 'presentations', title: 'Презентации' },
] as const;

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as unknown as [
  (typeof CATEGORIES)[number]['id'],
  ...(typeof CATEGORIES)[number]['id'][],
];
