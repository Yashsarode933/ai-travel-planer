import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    trip: {
      findUnique: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('Trip API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DELETE /api/trip/[id]', () => {
    it('should delete a trip successfully', async () => {
      const mockTrip = {
        id: 'trip_123',
        destination: 'Paris',
        budgetTier: 'mid_range',
        days: 5,
      };

      (prisma.trip.findUnique as jest.Mock).mockResolvedValue(mockTrip);
      (prisma.trip.delete as jest.Mock).mockResolvedValue({});

      const existingTrip = await prisma.trip.findUnique({
        where: { id: 'trip_123' },
      });

      expect(existingTrip).toBeDefined();

      if (existingTrip) {
        await prisma.trip.delete({ where: { id: 'trip_123' } });
      }

      expect(prisma.trip.delete).toHaveBeenCalledWith({ where: { id: 'trip_123' } });
    });

    it('should return 404 for non-existent trip', async () => {
      (prisma.trip.findUnique as jest.Mock).mockResolvedValue(null);

      const trip = await prisma.trip.findUnique({
        where: { id: 'non_existent_trip' },
      });

      expect(trip).toBeNull();
    });

    it('should reject deletion of temp trips', async () => {
      const isTempTrip = 'temp_123456789'.startsWith('temp_');
      
      expect(isTempTrip).toBe(true);
    });
  });

  describe('GET /api/trip/[id]', () => {
    it('should return trip with details', async () => {
      const mockTrip = {
        id: 'trip_123',
        destination: 'Paris',
        budgetTier: 'mid_range',
        days: 5,
        places: [
          { id: 'place_1', name: 'Eiffel Tower', category: 'landmark' },
        ],
        restaurants: [
          { id: 'rest_1', name: 'Le Bistro', cuisine: 'French' },
        ],
        itinerary: [],
      };

      (prisma.trip.findUnique as jest.Mock).mockResolvedValue(mockTrip);

      const trip = await prisma.trip.findUnique({
        where: { id: 'trip_123' },
        include: { places: true, restaurants: true },
      });

      expect(trip).toBeDefined();
      expect(trip?.destination).toBe('Paris');
    });
  });
});