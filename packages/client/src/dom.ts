import { FortiFiClientConfig, ArticleContent } from './types';

export class FortiFiDOM {
  private config: FortiFiClientConfig;

  constructor(config: FortiFiClientConfig) {
    this.config = config;
  }

  /**
   * Update article content in the DOM
   */
  updateContent(content: ArticleContent): void {
    const contentElement = this.getContentElement();
    if (!contentElement) {
      throw new Error(`Content element not found: ${this.config.contentSelector}`);
    }

    // Update title if available
    const titleElement = document.querySelector('title');
    if (titleElement && content.title) {
      titleElement.textContent = content.title;
    }

    // Update content
    contentElement.innerHTML = content.content;

    // Update metadata if available
    this.updateMetadata(content.metadata);

    if (this.config.debug) {
      console.log('[FortiFi] Content updated successfully');
    }
  }

  /**
   * Show paywall CTA
   */
  showCTA(): void {
    const ctaElement = this.getCTAElement();
    if (!ctaElement) {
      console.warn('[FortiFi] CTA element not found, creating default');
      this.createDefaultCTA();
      return;
    }

    const ctaHTML = this.config.ctaTemplate || this.getDefaultCTATemplate();
    ctaElement.innerHTML = ctaHTML;
    (ctaElement as HTMLElement).style.display = 'block';

    if (this.config.debug) {
      console.log('[FortiFi] CTA displayed');
    }
  }

  /**
   * Hide paywall CTA
   */
  hideCTA(): void {
    const ctaElement = this.getCTAElement();
    if (ctaElement) {
      (ctaElement as HTMLElement).style.display = 'none';
    }
  }

  /**
   * Get content element
   */
  private getContentElement(): Element | null {
    const selector = this.config.contentSelector || '#article-body';
    return document.querySelector(selector);
  }

  /**
   * Get CTA element
   */
  private getCTAElement(): Element | null {
    const selector = this.config.ctaSelector || '#paywall-cta';
    return document.querySelector(selector);
  }

  /**
   * Create default CTA if none exists
   */
  private createDefaultCTA(): void {
    const contentElement = this.getContentElement();
    if (!contentElement) return;

    const ctaElement = document.createElement('div');
    ctaElement.id = 'paywall-cta';
    ctaElement.className = 'fortifi-paywall-cta';
    ctaElement.innerHTML = this.getDefaultCTATemplate();

    // Insert after content element
    contentElement.parentNode?.insertBefore(ctaElement, contentElement.nextSibling);
  }

  /**
   * Get default CTA template
   */
  private getDefaultCTATemplate(): string {
    return `
      <div style="
        background: #141414;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 10px;
        padding: 1.25rem;
        margin: 1.25rem 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <h3 style="margin: 0 0 0.4rem 0; color: #ffffff; font-size: 1rem; letter-spacing: -0.02em;">Held on the server</h3>
        <p style="margin: 0 0 1rem 0; color: rgba(255, 255, 255, 0.6); line-height: 1.55;">
          Full HTML loads only after the server accepts a short-lived token.
        </p>
        <button
          id="fortifi-subscribe-btn"
          type="button"
          style="
            background: #f4f4f5;
            color: #0d0d0d;
            border: 1px solid #f4f4f5;
            min-height: 44px;
            padding: 0.65rem 1rem;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
          "
          onpointerdown="this.style.transform='scale(0.97)'"
          onpointerup="this.style.transform='scale(1)'"
          onpointerleave="this.style.transform='scale(1)'"
        >
          Unlock content
        </button>
      </div>
    `;
  }

  /**
   * Update article metadata in the DOM
   */
  private updateMetadata(metadata: ArticleContent['metadata']): void {
    // Update meta tags
    this.updateMetaTag('author', metadata.author);
    this.updateMetaTag('article:author', metadata.author);
    this.updateMetaTag('article:published_time', metadata.publishedAt);
    this.updateMetaTag('article:section', metadata.category);

    // Update keywords
    if (metadata.tags.length > 0) {
      this.updateMetaTag('keywords', metadata.tags.join(', '));
    }

    // Update Open Graph tags
    this.updateMetaTag('og:type', 'article');
    this.updateMetaTag('og:author', metadata.author);
    this.updateMetaTag('article:published_time', metadata.publishedAt);
  }

  /**
   * Update or create meta tag
   */
  private updateMetaTag(name: string, content: string): void {
    let metaTag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;

    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = name;
      document.head.appendChild(metaTag);
    }

    metaTag.content = content;
  }

  /**
   * Add event listener to CTA button
   */
  addCTAEventListener(callback: () => void): void {
    const button = document.getElementById('fortifi-subscribe-btn');
    if (button) {
      button.addEventListener('click', callback);
    }
  }

  /**
   * Remove event listener from CTA button
   */
  removeCTAEventListener(callback: () => void): void {
    const button = document.getElementById('fortifi-subscribe-btn');
    if (button) {
      button.removeEventListener('click', callback);
    }
  }
}
