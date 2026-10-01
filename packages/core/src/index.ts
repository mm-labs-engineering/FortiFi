import jwt from 'jsonwebtoken';

export type FortiFiOptions = {
  /** HMAC secret used to sign and verify tokens. */
  secret: string;
  /** Token lifetime in seconds. Defaults to 60. */
  ttlSeconds?: number;
};

export type AccessToken = {
  userId: string;
  articleId: string;
};

export type GateInput<T> = {
  articleId: string;
  /** Bearer token, or null when the request has none. */
  token?: string | null;
  full: T;
  teaser: T;
};

const DEFAULT_TTL_SECONDS = 60;

export function createFortiFi(options: FortiFiOptions) {
  const ttlSeconds = options.ttlSeconds ?? DEFAULT_TTL_SECONDS;

  function sign(userId: string, articleId: string): string {
    return jwt.sign({ userId, articleId, type: 'access' }, options.secret, {
      algorithm: 'HS256',
      expiresIn: ttlSeconds,
    });
  }

  function read(token: string): AccessToken | null {
    try {
      const decoded = jwt.verify(token, options.secret, {
        algorithms: ['HS256'],
      }) as jwt.JwtPayload;

      const userId = decoded['userId'];
      const articleId = decoded['articleId'];
      if (
        typeof userId !== 'string' ||
        typeof articleId !== 'string' ||
        decoded['type'] !== 'access'
      ) {
        return null;
      }

      return { userId, articleId };
    } catch {
      return null;
    }
  }

  function open<T>(input: GateInput<T>): T {
    if (!input.token) {
      return input.teaser;
    }

    const access = read(input.token);
    if (!access || access.articleId !== input.articleId) {
      return input.teaser;
    }

    return input.full;
  }

  return { sign, read, open };
}

export type FortiFi = ReturnType<typeof createFortiFi>;
