import { createFortiFi } from '@fortifi/core';

const fortifi = createFortiFi({
  secret: process.env.FORTIFI_SECRET ?? 'dev-only-secret',
});

const articles: Record<string, { teaser: string; full: string }> = {
  'paid-1': {
    teaser: '<p>The first paragraph.</p>',
    full: '<article><p>The first paragraph.</p><p>The rest stays on the server.</p></article>',
  },
};

export async function GET(request: Request, context: { params: { id: string } }) {
  const article = articles[context.params.id];
  if (!article) {
    return new Response('Not found', { status: 404 });
  }

  const header = request.headers.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  const html = fortifi.open({
    articleId: context.params.id,
    token,
    full: article.full,
    teaser: article.teaser,
  });

  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
