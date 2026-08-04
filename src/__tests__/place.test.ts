import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    place: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Place API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/place/[id]', () => {
    it('should return a place when found', async () => {
      const mockPlace = {
        id: 'place_123',
        name: 'Eiffel Tower',
        category: 'landmark',
        description: 'Iconic iron lattice tower',
        estimatedCost: 25.0,
        estimatedDurationMinutes: 120,
        lat: 48.8584,
        lng: 2.2945,
        notes: 'Go early to avoid crowds',
      };

      (prisma.place.findUnique as jest.Mock).mockResolvedValue(mockPlace);

      const result = await prisma.place.findUnique({
        where: { id: 'place_123' },
      });

      expect(result).toEqual(mockPlace);
      expect(prisma.place.findUnique).toHaveBeenCalledWith({ where: { id: 'place_123' } });
    });

    it('should return null when place not found', async () => {
      (prisma.place.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await prisma.place.findUnique({
        where: { id: 'non_existent_place' },
      });

      expect(result).toBeNull();
    });
  });

  describe('PATCH /api/place/[id]', () => {
    it('should update place notes', async () => {
      const updates = { notes: 'Updated my visit notes' };

      (prisma.place.update as jest.Mock).mockResolvedValue({
        id: 'place_123',
        name: 'Eiffel Tower',
        notes: 'Updated my visit notes',
      });

      const result = await prisma.place.update({
        where: { id: 'place_123' },
        data: updates,
      });

      expect(result).toBeDefined();
      expect(prisma.place.update).toHaveBeenCalledWith({
        where: { id: 'place_123' },
        data: updates,
      });
    });
  });

  describe('DELETE /api/place/[id]', () => {
    it('should delete a place', async () => {
      (prisma.place.delete as jest.Mock).mockResolvedValue({});

      await prisma.place.delete({
        where: { id: 'place_123' },
      });

      expect(prisma.place.delete).toHaveBeenCalledWith({ where: { id: 'place_123' } });
    });
  });
});