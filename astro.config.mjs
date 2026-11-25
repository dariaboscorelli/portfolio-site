import { defineConfig } from 'astro/config';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  // Сайт на GitHub Pages: https://dariaboscorelli.github.io/portfolio-site/
  // После подключения своего домена: site: 'https://ваш-домен', base — удалить (или '/').
  site: 'https://dariaboscorelli.github.io',
  base: '/portfolio-site',
  devToolbar: { enabled: false },
});
