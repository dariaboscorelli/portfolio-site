// Вход в админку Decap CMS через GitHub — шаг 1: отправляем на страницу входа GitHub.
// Нужны переменные окружения в Netlify: GITHUB_CLIENT_ID и GITHUB_CLIENT_SECRET.

export default async (req) => {
  const url = new URL(req.url);
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return new Response('В Netlify не задана переменная GITHUB_CLIENT_ID', { status: 500 });
  }

  const state = crypto.randomUUID();
  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.searchParams.set('client_id', clientId);
  authorize.searchParams.set('redirect_uri', `${url.origin}/api/callback`);
  authorize.searchParams.set('scope', url.searchParams.get('scope') || 'repo');
  authorize.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorize.toString(),
      'Set-Cookie': `decap_oauth_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
      'Cache-Control': 'no-store',
    },
  });
};

export const config = { path: '/api/auth' };
