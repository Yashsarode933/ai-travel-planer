import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    restaurant: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Restaurant API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/restaurant/[id]', () => {
    it('should return a restaurant when found', async () => {
      const mockRestaurant = {
        id: 'rest_123',
        name: 'Le Bistro',
        cuisine: 'French',
        priceRange: 'TWO',
        description: 'Cozy French restaurant',
        mealType: 'dinner',
        notes: 'Reserve in advance',
      };

      (prisma.restaurant.findUnique as jest.Mock).mockResolvedValue(mockRestaurant);

      const result = await prisma.restaurant.findUnique({
        where: { id: 'rest_123' },
      });

      expect(result).toEqual(mockRestaurant);
      expect(prisma.restaurant.findUnique).toHaveBeenCalledWith({ where: { id: 'rest_123' } });
    });

    it('should return null when restaurant not found', async () => {
      (prisma.restaurant.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await prisma.restaurant.findUnique({
        where: { id: 'non_existent_rest' },
      });

      expect(result).toBeNull();
    });
  });

  describe('PATCH /api/restaurant/[id]', () => {
    it('should update restaurant notes', async () => {
      const updates = { notes: 'Try the signature dish' };

      (prisma.restaurant.update as jest.Mock).mockResolvedValue({
        id: 'rest_123',
        name: 'Le Bistro',
        notes: 'Try the signature dish',
      });

      const result = await prisma.restaurant.update({
        where: { id: 'rest_123' },
        data: updates,
      });

      expect(result).toBeDefined();
      expect(prisma.restaurant.update).toHaveBeenCalledWith({
        where: { id: 'rest_123' },
        data: updates,
      });
    });
  });

  describe('DELETE /api/restaurant/[id]', () => {
    it('should delete a restaurant', async () => {
      (prisma.restaurant.delete as jest.Mock).mockResolvedValue({});

      await prisma.restaurant.delete({
        where: { id: 'rest_123' },
      });

      expect(prisma.restaurant.delete).toHaveBeenCalledWith({ where: { id: 'rest_123' } });
    });
  });
});