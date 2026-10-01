# FortiFi

A small Node library that keeps paid articles off the wire until the reader has access.

> Part of [Millimeter Labs](https://labs.40millimeter.com/products/fortifi). MIT.

## The problem

Many paywalls send the whole article in the page, then cover it with an overlay or a CSS class. The paid text is already in the browser. View source, reader mode, turning off JavaScript, or a plain `curl` shows it. Scrapers get it for free too.

The fix is to decide on the server and only send the paid HTML to readers who are allowed to see it. FortiFi is the smallest piece of that decision.

## What it does

Your server already knows who has paid. FortiFi turns that into a short token for one article, and then picks which body to send.

1. A reader with access asks for an article. Your code checks the subscription the way it already does, through Stripe, your database, or your auth provider.
2. Your server calls `sign(userId, articleId)` and gives the reader a token. It lasts 60 seconds by default.
3. The page requests the article with `Authorization: Bearer <token>`.
4. Your route calls `open(...)` with the teaser and the full HTML. FortiFi returns the full HTML only when the token is valid, unexpired, and was minted for that exact article. Every other case gets the teaser.

The teaser response has none of the paid bytes in it. There is nothing for CSS, the DOM inspector, or a scraper to uncover.

## What it does not do

- **Billing or login.** You decide who has paid. FortiFi enforces that decision on the response.
- **Stop paying readers from copying.** Once the full HTML reaches a browser, the reader has it.
- **Single use or revocation.** A token works for its article until it expires. Keep the lifetime short.
- **Client-side secrets.** The signing secret stays on your server. Never ship it to the browser.

## Install

The package is not on npm yet. Build it from this repository.

```bash
git clone https://github.com/mm-labs-engineering/FortiFi.git
cd FortiFi
pnpm install
pnpm run build
```

## Use

```typescript
import { createFortiFi } from '@fortifi/core';

const fortifi = createFortiFi({
  secret: process.env.FORTIFI_SECRET!,
  ttlSeconds: 60,
});

// After your own access check passes
const token = fortifi.sign('reader-1', 'paid-1');

// In the article route
const html = fortifi.open({
  articleId: 'paid-1',
  token, // null when the request has no Authorization header
  teaser: '<p>The first paragraph.</p>',
  full: '<article><p>The first paragraph.</p><p>The rest stays on the server.</p></article>',
});
```

| Call | Returns |
|------|---------|
| `sign(userId, articleId)` | A signed HS256 token for one article |
| `read(token)` | `{ userId, articleId }`, or `null` when the token is invalid or expired |
| `open({ articleId, token, teaser, full })` | `full` for a matching token, otherwise `teaser` |

A Next.js App Router route is in [`examples/nextjs`](examples/nextjs).

## Check it yourself

Request a paid article with no token and search the response for a sentence that is only in the full body.

```bash
curl -s https://your-site.example/article/paid-1 | grep "The rest stays on the server"
```

No match means the paid text never left your server.

The same rule is the test suite in `packages/core/src/__tests__/gate.test.ts`. No token, a garbage token, an expired token, and a token for a different article all return the teaser. Only a matching token returns the full body.

## Develop

```bash
pnpm install
pnpm test
pnpm run build
```
