import { FortiFiClientConfig, TokenResponse, ArticleContent, ErrorResponse } from './types';

export class FortiFiAPI {
  private config: FortiFiClientConfig;

  constructor(config: FortiFiClientConfig) {
    this.config = config;
  }

  /**
   * Request a token for accessing article content
   */
  async requestToken(): Promise<TokenResponse> {
    const response = await this.makeRequest('/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        articleId: this.config.articleId,
        userId: this.config.userId,
      }),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(`Token request failed: ${error.error}`);
    }

    return response.json();
  }

  /**
   * Fetch article content using a token
   */
  async fetchArticleContent(token: string): Promise<ArticleContent> {
    const response = await this.makeRequest(`/api/article/${this.config.articleId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid or expired token');
      } else if (response.status === 429) {
        const rateLimitInfo = this.parseRateLimitHeaders(response);
        throw new Error(`Rate limit exceeded. Try again in ${rateLimitInfo.resetTime} seconds.`);
      } else {
        const error: ErrorResponse = await response.json();
        throw new Error(`Failed to fetch article: ${error.error}`);
      }
    }

    return response.json();
  }

  /**
   * Make HTTP request with error handling
   */
  private async makeRequest(url: string, options: RequestInit): Promise<Response> {
    try {
      const fullUrl = `${this.config.apiUrl}${url}`;
      
      if (this.config.debug) {
        console.log(`[FortiFi] Making request to: ${fullUrl}`, options);
      }

      const response = await fetch(fullUrl, options);
      
      if (this.config.debug) {
        console.log(`[FortiFi] Response status: ${response.status}`, response);
      }

      return response;
    } catch (error) {
      if (this.config.debug) {
        console.error('[FortiFi] Request failed:', error);
      }
      throw error;
    }
  }

  /**
   * Parse rate limit headers from response
   */
  private parseRateLimitHeaders(response: Response): { resetTime: number } {
    const retryAfter = response.headers.get('Retry-After');
    const resetTime = retryAfter ? parseInt(retryAfter, 10) : 60;
    
    return { resetTime };
  }
}
