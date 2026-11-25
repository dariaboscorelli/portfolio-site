// Адреса внутри сайта с учётом папки, в которой он лежит (base в astro.config.mjs).
// На GitHub Pages сайт открывается по адресу /portfolio-site/, а после подключения своего домена — из корня.
// В админке пути хранятся без этой папки (например, /images/uploads/x.webp) — добавляем её при выводе.

const BASE = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;

export function u(path: string): string;
export function u(path?: string): string | undefined;
export function u(path?: string) {
  if (!path) return path;
  if (/^([a-z]+:|#|\/\/)/i.test(path)) return path; // внешние ссылки, mailto:, якоря
  return BASE + path.replace(/^\//, '');
}
