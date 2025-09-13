import jwt from 'jsonwebtoken';
import { FortiFiConfig, TokenPayload } from './types';

export class JWTManager {
  private config: FortiFiConfig;

  constructor(config: FortiFiConfig) {
    this.config = config;
  }

  generateToken(userId: string, articleId: string): string {
    const now = Math.floor(Date.now() / 1000);
    const payload: TokenPayload = {
      userId,
      articleId,
      iat: now,
      exp: now + this.config.token.ttl,
      type: 'access',
    };

    return jwt.sign(payload, this.config.jwtSecret, {
      algorithm: this.config.token.algorithm,
    });
  }

  verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.config.jwtSecret, {
        algorithms: [this.config.token.algorithm],
      }) as TokenPayload;

      // Validate token structure
      if (
        !decoded.userId ||
        !decoded.articleId ||
        !decoded.iat ||
        !decoded.exp ||
        decoded.type !== 'access'
      ) {
        return null;
      }

      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        return null;
      }

      return decoded;
    } catch (error) {
      return null;
    }
  }

  decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token) as TokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded) return true;

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  }
}
