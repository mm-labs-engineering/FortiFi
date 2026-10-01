# `@fortifi/core`

```typescript
const fortifi = createFortiFi({ secret: string, ttlSeconds?: number })

fortifi.sign(userId: string, articleId: string): string
fortifi.read(token: string): { userId: string; articleId: string } | null
fortifi.open({ articleId, token, full, teaser }): full | teaser
```

`ttlSeconds` defaults to 60. `open` returns `teaser` unless `read(token)` succeeds and `articleId` matches.
