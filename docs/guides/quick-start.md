# Quick start

```bash
npm install @fortifi/core
```

```typescript
import { createFortiFi } from '@fortifi/core';

const fortifi = createFortiFi({ secret: process.env.FORTIFI_SECRET! });
const token = fortifi.sign(userId, articleId);
const html = fortifi.open({ articleId, token, teaser, full });
```

See [`examples/nextjs`](../../examples/nextjs) for an App Router handler.
