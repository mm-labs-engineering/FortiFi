import { createFortiFi } from '../index';

const PREMIUM = 'PREMIUM_SENTENCE_NOT_IN_THE_TEASER';
const teaser = '<p>The first paragraph.</p>';
const full = `<article><p>The first paragraph.</p><p>${PREMIUM}</p></article>`;

describe('createFortiFi', () => {
  const fortifi = createFortiFi({ secret: 'test-secret' });

  it('returns a teaser that contains zero premium bytes when no token is sent', () => {
    const body = fortifi.open({ articleId: 'paid-1', token: null, full, teaser });

    expect(body).toBe(teaser);
    expect(body).not.toContain(PREMIUM);
  });

  it('returns the full body only for a token minted for that article', () => {
    const token = fortifi.sign('reader-1', 'paid-1');

    expect(fortifi.open({ articleId: 'paid-1', token, full, teaser })).toBe(full);
  });

  it('withholds the body when the token was minted for a different article', () => {
    const token = fortifi.sign('reader-1', 'other-article');
    const body = fortifi.open({ articleId: 'paid-1', token, full, teaser });

    expect(body).toBe(teaser);
    expect(body).not.toContain(PREMIUM);
  });

  it('withholds the body for a garbage token', () => {
    const body = fortifi.open({
      articleId: 'paid-1',
      token: 'not-a-token',
      full,
      teaser,
    });

    expect(body).toBe(teaser);
    expect(body).not.toContain(PREMIUM);
  });

  it('withholds the body after the token expires', async () => {
    const short = createFortiFi({ secret: 'test-secret', ttlSeconds: 1 });
    const token = short.sign('reader-1', 'paid-1');

    await new Promise(resolve => setTimeout(resolve, 1500));

    const body = short.open({ articleId: 'paid-1', token, full, teaser });
    expect(body).toBe(teaser);
    expect(body).not.toContain(PREMIUM);
  });
});
