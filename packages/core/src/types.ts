export interface FortiFiConfig {
  /** JWT secret for token signing and verification */
  jwtSecret: string;
  /** Redis connection configuration */
  redis: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  /** Rate limiting configuration */
  rateLimit: {
    /** Maximum requests per window per IP */
    maxRequests: number;
    /** Time window in seconds */
    windowMs: number;
    /** Block duration in seconds when limit exceeded */
    blockDurationMs: number;
  };
  /** Token configuration */
  token: {
    /** Token TTL in seconds (default: 60) */
    ttl: number;
    /** Algorithm for JWT signing (default: HS256) */
    algorithm: 'HS256' | 'HS384' | 'HS512';
  };
  /** Security headers configuration */
  security: {
    /** Enable CORS */
    enableCors: boolean;
    /** CORS origins (default: ['*']) */
    corsOrigins: string[];
    /** Enable Helmet security headers */
    enableHelmet: boolean;
  };
  /** Watermarking configuration */
  watermarking?: {
    /** Enable watermarking for PDF/PNG assets */
    enabled: boolean;
    /** Watermark text template (supports {userId}, {timestamp}) */
    textTemplate: string;
    /** Watermark opacity (0-1) */
    opacity: number;
    /** Watermark position */
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  };
}

export interface TokenPayload {
  /** User identifier */
  userId: string;
  /** Article identifier */
  articleId: string;
  /** Token issued at timestamp */
  iat: number;
  /** Token expiration timestamp */
  exp: number;
  /** Token type */
  type: 'access';
}

export interface ArticleContent {
  /** Article ID */
  id: string;
  /** Article title */
  title: string;
  /** Article content HTML */
  content: string;
  /** Article metadata */
  metadata: {
    author: string;
    publishedAt: string;
    tags: string[];
    category: string;
  };
  /** Asset URLs (for PDFs, images, etc.) */
  assets?: {
    pdf?: string;
    images?: string[];
  };
}

export interface RateLimitInfo {
  /** Current request count */
  count: number;
  /** Maximum allowed requests */
  limit: number;
  /** Time window in seconds */
  windowMs: number;
  /** Time until reset in seconds */
  resetTime: number;
  /** Whether limit is exceeded */
  exceeded: boolean;
}

export interface FortiFiMiddleware {
  /** Express middleware for token validation */
  validateToken: (req: any, res: any, next: any) => void;
  /** Express middleware for rate limiting */
  rateLimit: (req: any, res: any, next: any) => void;
  /** Express middleware for security headers */
  security: (req: any, res: any, next: any) => void;
  /** Generate JWT token for user/article */
  generateToken: (userId: string, articleId: string) => string;
  /** Verify JWT token */
  verifyToken: (token: string) => TokenPayload | null;
  /** Get rate limit info for IP */
  getRateLimitInfo: (ip: string) => Promise<RateLimitInfo>;
  /** Check if IP is blocked */
  isBlocked: (ip: string) => Promise<boolean>;
  /** Block IP address */
  blockIp: (ip: string, durationMs: number) => Promise<void>;
  /** Unblock IP address */
  unblockIp: (ip: string) => Promise<void>;
}

export interface ExpressRequest extends Request {
  fortifi?: {
    token?: TokenPayload;
    rateLimitInfo?: RateLimitInfo;
    isBlocked?: boolean;
  };
}

export interface FastifyRequest extends Request {
  fortifi?: {
    token?: TokenPayload;
    rateLimitInfo?: RateLimitInfo;
    isBlocked?: boolean;
  };
}

export type Request = any; // Will be properly typed based on framework
