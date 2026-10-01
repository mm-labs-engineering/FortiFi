# Next.js route

Paste `app/article/[id]/route.ts` into an App Router app that depends on `@fortifi/core`.

An unpaid `GET /article/paid-1` returns the teaser. The response does not contain `The rest stays on the server.` A token from `fortifi.sign(userId, 'paid-1')`, sent as `Authorization: Bearer`, returns the full HTML. A token minted for any other id returns the teaser again.
