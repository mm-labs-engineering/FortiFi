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
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        padding: 2rem;
        text-align: center;
        margin: 2rem 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <h3 style="margin: 0 0 1rem 0; color: #495057;">🔒 Premium Content</h3>
        <p style="margin: 0 0 1.5rem 0; color: #6c757d;">
          This content is available to premium subscribers only.
        </p>
        <button 
          id="fortifi-subscribe-btn"
          style="
            background: #007bff;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.2s;
          "
          onmouseover="this.style.background='#0056b3'"
          onmouseout="this.style.background='#007bff'"
        >
          Subscribe Now
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
