# Портфолио Дарьи Жук

Сайт на [Astro](https://astro.build), свёрстан по макету Figma «Дизайн сайта».

## Запуск на компьютере

```
npm install
npm run dev      # http://localhost:4321
npm run build    # готовый сайт в папке dist/
```

## Где что лежит

| Что | Файл |
| --- | --- |
| Кейсы (плитки и страницы) | `src/content/cases/*.yml` — один файл = один кейс, имя файла = адрес `/work/<имя>/` |
| Картинки кейсов | `public/images/uploads/` |
| Почта, Telegram, Behance, резюме, тексты главной | `src/data/site.json` |
| Страница «Обо мне» | `src/data/about.json` |
| Направления фильтра | `src/lib/categories.ts` |

### Поля кейса

- `title`, `tag`, `summary` — название, красная подпись и строка под названием на плитке;
- `category` — направление для фильтра: `esports`, `branding`, `ads`, `special`, `ai`, `presentations`;
- `order` — порядок на главной (нечётные идут в левую колонку, чётные — в правую);
- `cover`, `coverHeight` — обложка и её высота при ширине плитки 468 px;
- `showOnHome: false` — скрыть плитку с главной (страница кейса остаётся);
- `lead`, `client`, `role`, `tools`, `hero` — левая колонка и главная картинка страницы кейса;
- `sections` — разделы «Задача / Моя роль / Результат»; внутри `media` — блоки `image` (картинка), `row` (ряд картинок одной высоты) и `caption` (тёмная плашка с подписью).

Пропорции картинок берутся из самих файлов, отдельно их указывать не нужно.

## Админка (Decap CMS)

Адрес: `/admin/`. Настройки полей — `public/admin/config.yml`.

**На своём компьютере, без интернета и аккаунтов:** в двух окнах терминала запустите
`npm run cms` и `npm run dev`, затем откройте http://localhost:4321/admin/index.html и нажмите «Войти».
Правки сразу записываются в файлы проекта.

## Где работает сайт

- **Сайт:** GitHub Pages — https://dariaboscorelli.github.io/portfolio-site/
  Публикуется сам при каждом изменении в ветке `main` (`.github/workflows/deploy.yml`), обычно за 1–2 минуты.
  Ход публикации: вкладка Actions в репозитории.
- **Админка:** https://portfolio-site-86is.netlify.app/admin/ → «Войти через GitHub».
  Она осталась на Netlify, потому что там работает вход через GitHub (функции `netlify/functions/auth.mjs`
  и `callback.mjs`, переменные `GITHUB_CLIENT_ID` и `GITHUB_CLIENT_SECRET` в Netlify → Keys and secrets).
  Автосборки на Netlify остановлены (Build status: Stopped), поэтому кредиты Netlify не тратятся.
  Если поменяются поля админки (`public/admin/*`), их нужно один раз опубликовать на Netlify вручную
  (Deploys → Trigger deploy) — это одна публикация из 20 бесплатных в месяц.

Картинки и видео: GitHub Pages отдаёт файлы до 100 МБ, весь сайт — до 1 ГБ.

**Свой домен:** в `astro.config.mjs` указать `site: 'https://ваш-домен'` и убрать `base`,
затем подключить домен в репозитории: Settings → Pages → Custom domain.

## Широкие экраны

Сайт свёрстан по макету 1440 px. На экранах шире 2048 px он увеличивается целиком
(как масштаб браузера), чтобы фотографии не разрастались: на 2560 px — 125 %.
Настройка — в конце `src/styles/global.css`.