import { PrismaClient } from '@prisma/client';
import { ArticleService, ArticleResponse, DatabaseArticle } from '../types';

export class ArticleServiceImpl implements ArticleService {
  constructor(private prisma: PrismaClient) {}

  async getArticle(id: string, userId?: string): Promise<ArticleResponse | null> {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!article) {
      return null;
    }

    // Check if user has access to premium content
    if (article.isPremium && userId) {
      const hasAccess = await this.checkUserAccess(userId, article.id);
      if (!hasAccess) {
        // Return teaser content for premium articles
        return {
          id: article.id,
          title: article.title,
          content: article.teaser || 'This is premium content. Please subscribe to access.',
          metadata: {
            author: article.author,
            publishedAt: article.publishedAt.toISOString(),
            tags: article.tags,
            category: article.category || undefined,
          },
          assets: this.extractAssets(article),
        };
      }
    }

    return {
      id: article.id,
      title: article.title,
      content: article.content,
      metadata: {
        author: article.author,
        publishedAt: article.publishedAt.toISOString(),
        tags: article.tags,
        category: article.category || undefined,
      },
      assets: this.extractAssets(article),
    };
  }

  async createArticle(data: Partial<ArticleResponse>): Promise<ArticleResponse> {
    const article = await this.prisma.article.create({
      data: {
        title: data.title || '',
        content: data.content || '',
        teaser: data.content?.substring(0, 200) + '...', // Auto-generate teaser
        author: data.metadata?.author || 'Unknown',
        category: data.metadata?.category,
        tags: data.metadata?.tags || [],
        isPremium: false, // Default to free content
        metadata: data.assets || {},
        userId: 'system', // This should come from authenticated user
      },
    });

    return this.mapToResponse(article);
  }

  async updateArticle(id: string, data: Partial<ArticleResponse>): Promise<ArticleResponse | null> {
    const article = await this.prisma.article.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.metadata?.author && { author: data.metadata.author }),
        ...(data.metadata?.category && { category: data.metadata.category }),
        ...(data.metadata?.tags && { tags: data.metadata.tags }),
        ...(data.assets && { metadata: data.assets }),
      },
    });

    return this.mapToResponse(article);
  }

  async deleteArticle(id: string): Promise<boolean> {
    try {
      await this.prisma.article.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  private async checkUserAccess(userId: string, articleId: string): Promise<boolean> {
    // Check if user has an active subscription
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        currentPeriodEnd: {
          gt: new Date(),
        },
      },
    });

    if (!subscription) {
      return false;
    }

    // Check if user has a valid token for this article
    const token = await this.prisma.token.findFirst({
      where: {
        userId,
        articleId,
        expiresAt: {
          gt: new Date(),
        },
        isUsed: false,
      },
    });

    return !!token;
  }

  private extractAssets(article: DatabaseArticle): ArticleResponse['assets'] {
    const metadata = article.metadata as Record<string, unknown>;
    if (!metadata || typeof metadata !== 'object') {
      return undefined;
    }

    return {
      pdf: metadata.pdf,
      images: metadata.images,
    };
  }

  private mapToResponse(article: DatabaseArticle): ArticleResponse {
    return {
      id: article.id,
      title: article.title,
      content: article.content,
      metadata: {
        author: article.author,
        publishedAt: article.publishedAt.toISOString(),
        tags: article.tags,
        category: article.category || undefined,
      },
      assets: this.extractAssets(article),
    };
  }
}
