import { FortiFiClientConfig, ArticleContent, TokenResponse } from './types';
import { FortiFiAPI } from './api';
import { FortiFiDOM } from './dom';

export class FortiFiClient {
  private config: FortiFiClientConfig;
  private api: FortiFiAPI;
  private dom: FortiFiDOM;
  private currentToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(config: FortiFiClientConfig) {
    this.config = {
      contentSelector: '#article-body',
      ctaSelector: '#paywall-cta',
      debug: false,
      ...config,
    };

    this.api = new FortiFiAPI(this.config);
    this.dom = new FortiFiDOM(this.config);

    this.log('FortiFi client initialized', this.config);
  }

  /**
   * Initialize the FortiFi client and load content
   */
  async init(): Promise<void> {
    try {
      this.log('Starting FortiFi initialization...');

      // Check if we have a valid token in localStorage
      const storedToken = this.getStoredToken();
      if (storedToken && this.isTokenValid(storedToken)) {
        this.log('Using stored token');
        this.currentToken = storedToken;
        await this.loadContent();
        return;
      }

      // Show CTA if no valid token
      this.dom.showCTA();
      this.dom.addCTAEventListener(() => this.handleCTAClick());

    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Request a new token and load content
   */
  async requestAccess(): Promise<void> {
    try {
      this.log('Requesting access token...');

      const tokenResponse = await this.api.requestToken();
      this.currentToken = tokenResponse.token;
      this.tokenExpiry = tokenResponse.expiresAt;

      // Store token for future use
      this.storeToken(tokenResponse.token, tokenResponse.expiresAt);

      // Notify token handler
      if (this.config.onToken) {
        this.config.onToken(tokenResponse.token);
      }

      await this.loadContent();

    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Load article content using current token
   */
  private async loadContent(): Promise<void> {
    if (!this.currentToken) {
      throw new Error('No valid token available');
    }

    try {
      this.log('Loading article content...');

      const content = await this.api.fetchArticleContent(this.currentToken);
      
      // Update DOM with content
      this.dom.updateContent(content);
      this.dom.hideCTA();

      // Notify success handler
      if (this.config.onSuccess) {
        this.config.onSuccess(content.content);
      }

      this.log('Content loaded successfully');

    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Handle CTA button click
   */
  private async handleCTAClick(): Promise<void> {
    try {
      await this.requestAccess();
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Get stored token from localStorage
   */
  private getStoredToken(): string | null {
    try {
      const stored = localStorage.getItem('fortifi_token');
      if (!stored) return null;

      const { token, expiresAt } = JSON.parse(stored);
      if (expiresAt && Date.now() > expiresAt) {
        localStorage.removeItem('fortifi_token');
        return null;
      }

      return token;
    } catch {
      return null;
    }
  }

  /**
   * Store token in localStorage
   */
  private storeToken(token: string, expiresAt: number): void {
    try {
      localStorage.setItem('fortifi_token', JSON.stringify({
        token,
        expiresAt,
      }));
    } catch (error) {
      this.log('Failed to store token:', error);
    }
  }

  /**
   * Check if token is valid
   */
  private isTokenValid(token: string): boolean {
    if (!token) return false;
    
    try {
      // Basic JWT structure check
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      // Decode payload to check expiration
      const payload = JSON.parse(atob(parts[1] || ''));
      const now = Math.floor(Date.now() / 1000);
      
      return payload.exp && payload.exp > now;
    } catch {
      return false;
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: Error): void {
    this.log('Error:', error);

    if (this.config.onError) {
      this.config.onError(error);
    } else {
      console.error('[FortiFi]', error.message);
    }

    // Show CTA on error
    this.dom.showCTA();
  }

  /**
   * Log debug messages
   */
  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[FortiFi]', ...args);
    }
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.currentToken;
  }

  /**
   * Clear stored token
   */
  clearToken(): void {
    this.currentToken = null;
    this.tokenExpiry = null;
    localStorage.removeItem('fortifi_token');
  }

  /**
   * Check if user has access
   */
  hasAccess(): boolean {
    return this.currentToken !== null && this.isTokenValid(this.currentToken);
  }
}

// Global FortiFi object for UMD
declare global {
  interface Window {
    FortiFi: {
      init: (config: FortiFiClientConfig) => Promise<FortiFiClient>;
      create: (config: FortiFiClientConfig) => FortiFiClient;
    };
  }
}

// UMD export
if (typeof window !== 'undefined') {
  window.FortiFi = {
    init: async (config: FortiFiClientConfig) => {
      const client = new FortiFiClient(config);
      await client.init();
      return client;
    },
    create: (config: FortiFiClientConfig) => {
      return new FortiFiClient(config);
    },
  };
}

export default FortiFiClient;
