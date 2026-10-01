# FortiFi

One package. Sign a short token, verify it, and withhold the body.

An unpaid response contains zero premium bytes. A token opens only the article it was minted for. MIT.

> Part of [Millimeter Labs](https://labs.40millimeter.com/products/fortifi).

## Install

```bash
npm install @fortifi/core
```

## Use

```typescript
import { createFortiFi } from '@fortifi/core';

const fortifi = createFortiFi({ secret: process.env.FORTIFI_SECRET! });

const token = fortifi.sign('reader-1', 'paid-1');

const html = fortifi.open({
  articleId: 'paid-1',
  token, // null when the request has no Authorization header
  teaser: '<p>The first paragraph.</p>',
  full: '<article><p>The first paragraph.</p><p>The rest stays on the server.</p></article>',
});
```

`open` returns `teaser` when the token is missing, expired, or minted for a different article.

A Next.js App Router handler lives in [`examples/nextjs`](examples/nextjs).

## The test

`packages/core/src/__tests__/gate.test.ts` is the product:

- no token, and the body does not contain the premium sentence
- a token for that article returns the full body
- a token for any other article returns the teaser

## Not in this package

Hosted keys, a watermark that writes a file, billing, bot detection, and a dashboard. Those wait until a publisher asks.

## Develop

```bash
pnpm install
pnpm test
pnpm run build
```
