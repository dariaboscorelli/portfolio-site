// Вход в админку Decap CMS через GitHub — шаг 2: GitHub возвращает код, меняем его на токен
// и передаём токен в окно админки (только на тот же сайт).

const cookieValue = (header, name) =>
  (header || '').split(/;\s*/).find((c) => c.startsWith(`${name}=`))?.slice(name.length + 1);

export default async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const expected = cookieValue(req.headers.get('cookie'), 'decap_oauth_state');

  let status = 'error';
  let content = { error: 'Вход не удался: обновите страницу админки и попробуйте ещё раз.' };

  if (code && state && expected && state === expected) {
    try {
      const res = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${url.origin}/api/callback`,
        }),
      });
      const data = await res.json();
      if (data.access_token) {
        status = 'success';
        content = { token: data.access_token, provider: 'github' };
      } else {
        content = { error: data.error_description || data.error || 'GitHub не выдал токен' };
      }
    } catch {
      content = { error: 'Не удалось связаться с GitHub' };
    }
  }

  // Протокол Decap CMS: окно входа сообщает «authorizing», ждёт ответа админки и отдаёт результат.
  const safe = (v) => JSON.stringify(v).replace(/</g, '\\u003c');
  const message = `authorization:github:${status}:${JSON.stringify(content)}`;
  const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Вход…</title></head><body>
<script>
(function () {
  var origin = ${safe(url.origin)};
  var message = ${safe(message)};
  function receive(e) {
    if (e.origin !== origin) return;
    window.removeEventListener('message', receive, false);
    window.opener.postMessage(message, origin);
  }
  window.addEventListener('message', receive, false);
  window.opener.postMessage('authorizing:github', origin);
})();
</script>
</body></html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Set-Cookie': 'decap_oauth_state=; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
    },
  });
};

export const config = { path: '/api/callback' };
