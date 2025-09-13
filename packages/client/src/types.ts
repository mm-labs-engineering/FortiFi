export interface FortiFiClientConfig {
  /** API base URL */
  apiUrl: string;
  /** Article ID to load */
  articleId: string;
  /** User ID (optional, for personalized content) */
  userId?: string;
  /** CSS selector for article content container */
  contentSelector?: string;
  /** CSS selector for paywall CTA container */
  ctaSelector?: string;
  /** Custom CTA HTML template */
  ctaTemplate?: string;
  /** Enable debug logging */
  debug?: boolean;
  /** Custom error handler */
  onError?: (error: Error) => void;
  /** Custom success handler */
  onSuccess?: (content: string) => void;
  /** Custom token handler */
  onToken?: (token: string) => void;
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
  /** Asset URLs */
  assets?: {
    pdf?: string;
    images?: string[];
  };
}

export interface TokenResponse {
  /** JWT token */
  token: string;
  /** Token expiration timestamp */
  expiresAt: number;
  /** User ID */
  userId: string;
  /** Article ID */
  articleId: string;
}

export interface ErrorResponse {
  /** Error message */
  error: string;
  /** Error code */
  code?: string;
  /** Additional error details */
  details?: any;
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
