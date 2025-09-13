export { FortiFiMiddleware } from './middleware';
export { RedisClient } from './redis';
export { RateLimiter } from './rate-limiter';
export { JWTManager } from './jwt';
export * from './types';

// Convenience function to create middleware instance
import { FortiFiMiddleware } from './middleware';
export function createFortiFi(config: import('./types').FortiFiConfig) {
  return new FortiFiMiddleware(config);
}
