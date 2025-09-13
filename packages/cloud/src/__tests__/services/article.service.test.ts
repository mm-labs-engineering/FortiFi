import { ArticleServiceImpl } from '../../services/article.service';
import { PrismaClient } from '@prisma/client';

// Mock Prisma client
const mockPrisma = {
  article: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  subscription: {
    findFirst: jest.fn(),
  },
  token: {
    findFirst: jest.fn(),
  },
} as unknown as PrismaClient;

describe('ArticleServiceImpl', () => {
  let articleService: ArticleServiceImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    articleService = new ArticleServiceImpl(mockPrisma);
  });

  describe('getArticle', () => {
    it('should return article when found', async () => {
      const mockArticle = {
        id: 'article-1',
        title: 'Test Article',
        content: 'Test content',
        teaser: 'Test teaser',
        author: 'Test Author',
        publishedAt: new Date('2024-01-01'),
        category: 'Test Category',
        tags: ['test', 'article'],
        isPremium: false,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user-1',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      (mockPrisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle);

      const result = await articleService.getArticle('article-1', 'user-1');

      expect(result).toEqual({
        id: 'article-1',
        title: 'Test Article',
        content: 'Test content',
        metadata: {
          author: 'Test Author',
          publishedAt: '2024-01-01T00:00:00.000Z',
          tags: ['test', 'article'],
          category: 'Test Category',
        },
      });
    });

    it('should return null when article not found', async () => {
      (mockPrisma.article.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await articleService.getArticle('nonexistent', 'user-1');

      expect(result).toBeNull();
    });

    it('should return teaser for premium content without access', async () => {
      const mockArticle = {
        id: 'article-1',
        title: 'Premium Article',
        content: 'Premium content',
        teaser: 'Premium teaser',
        author: 'Test Author',
        publishedAt: new Date('2024-01-01'),
        category: 'Test Category',
        tags: ['premium'],
        isPremium: true,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user-1',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      (mockPrisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle);
      (mockPrisma.subscription.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await articleService.getArticle('article-1', 'user-1');

      expect(result?.content).toBe('Premium teaser');
    });
  });

  describe('createArticle', () => {
    it('should create article successfully', async () => {
      const articleData = {
        title: 'New Article',
        content: 'New content',
        metadata: {
          author: 'Test Author',
          publishedAt: '2024-01-01T00:00:00.000Z',
          tags: ['new'],
          category: 'Test',
        },
      };

      const mockCreatedArticle = {
        id: 'article-2',
        title: 'New Article',
        content: 'New content',
        teaser: 'New content...',
        author: 'Test Author',
        publishedAt: new Date('2024-01-01'),
        category: 'Test',
        tags: ['new'],
        isPremium: false,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'system',
      };

      (mockPrisma.article.create as jest.Mock).mockResolvedValue(mockCreatedArticle);

      const result = await articleService.createArticle(articleData);

      expect(result.title).toBe('New Article');
      expect(result.content).toBe('New content');
      expect(mockPrisma.article.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'New Article',
          content: 'New content',
          author: 'Test Author',
        }),
      });
    });
  });

  describe('updateArticle', () => {
    it('should update article successfully', async () => {
      const updateData = {
        title: 'Updated Article',
        content: 'Updated content',
      };

      const mockUpdatedArticle = {
        id: 'article-1',
        title: 'Updated Article',
        content: 'Updated content',
        teaser: 'Updated content...',
        author: 'Test Author',
        publishedAt: new Date('2024-01-01'),
        category: 'Test Category',
        tags: ['test', 'article'],
        isPremium: false,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user-1',
      };

      (mockPrisma.article.update as jest.Mock).mockResolvedValue(mockUpdatedArticle);

      const result = await articleService.updateArticle('article-1', updateData);

      expect(result?.title).toBe('Updated Article');
      expect(mockPrisma.article.update).toHaveBeenCalledWith({
        where: { id: 'article-1' },
        data: expect.objectContaining({
          title: 'Updated Article',
          content: 'Updated content',
        }),
      });
    });
  });

  describe('deleteArticle', () => {
    it('should delete article successfully', async () => {
      (mockPrisma.article.delete as jest.Mock).mockResolvedValue({});

      const result = await articleService.deleteArticle('article-1');

      expect(result).toBe(true);
      expect(mockPrisma.article.delete).toHaveBeenCalledWith({
        where: { id: 'article-1' },
      });
    });

    it('should return false when deletion fails', async () => {
      (mockPrisma.article.delete as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      const result = await articleService.deleteArticle('article-1');

      expect(result).toBe(false);
    });
  });
});
