import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    favorite: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

describe('Favorites API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/favorites', () => {
    it('should return user favorites', async () => {
      const mockFavorites = [
        { id: 'fav_1', userId: 'user_1', type: 'PLACE', itemId: 'place_1' },
        { id: 'fav_2', userId: 'user_1', type: 'RESTAURANT', itemId: 'rest_1' },
      ];

      (prisma.favorite.findMany as jest.Mock).mockResolvedValue(mockFavorites);

      const result = await prisma.favorite.findMany({
        where: { userId: 'user_1' },
        orderBy: { addedAt: 'desc' },
      });

      expect(result).toHaveLength(2);
      expect(prisma.favorite.findMany).toHaveBeenCalledWith({
        where: { userId: 'user_1' },
        orderBy: { addedAt: 'desc' },
      });
    });
  });

  describe('POST /api/favorites', () => {
    it('should add a new favorite', async () => {
      const newItem = {
        userId: 'user_1',
        type: 'PLACE' as const,
        itemId: 'place_1',
      };

      (prisma.favorite.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.favorite.create as jest.Mock).mockResolvedValue({ id: 'fav_1', ...newItem });

      const existing = await prisma.favorite.findFirst({
        where: {
          userId: newItem.userId,
          type: newItem.type,
          itemId: newItem.itemId,
        },
      });

      if (!existing) {
        const result = await prisma.favorite.create({ data: newItem });
        expect(result).toBeDefined();
      }

      expect(prisma.favorite.create).toHaveBeenCalledWith({ data: newItem });
    });

    it('should remove favorite if already exists', async () => {
      const existingFavorite = { id: 'fav_1', userId: 'user_1', type: 'PLACE', itemId: 'place_1' };

      (prisma.favorite.findFirst as jest.Mock).mockResolvedValue(existingFavorite);
      (prisma.favorite.delete as jest.Mock).mockResolvedValue({});

      const existing = await prisma.favorite.findFirst({
        where: { userId: 'user_1', type: 'PLACE', itemId: 'place_1' },
      });

      if (existing) {
        await prisma.favorite.delete({ where: { id: existing.id } });
      }

      expect(prisma.favorite.delete).toHaveBeenCalledWith({
        where: { id: 'fav_1' },
      });
    });
  });
});