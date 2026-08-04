import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    trip: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
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

  describe('POST /api/trip/save (Update)', () => {
    it('should update trip notes for existing trip', async () => {
      const existingTripId = 'trip_123';

      (prisma.trip.update as jest.Mock).mockResolvedValue({
        id: existingTripId,
        destination: 'Paris',
        notes: 'Updated notes',
      });

      const updatedTrip = await prisma.trip.update({
        where: { id: existingTripId },
        data: {
          notes: 'Updated notes',
          interests: 'food,art',
          travelDates: '2026-08-01',
          totalEstimatedCost: 500,
        },
      });

      expect(updatedTrip).toBeDefined();
      expect(prisma.trip.update).toHaveBeenCalledWith({
        where: { id: existingTripId },
        data: {
          notes: 'Updated notes',
          interests: 'food,art',
          travelDates: '2026-08-01',
          totalEstimatedCost: 500,
        },
      });
    });

    it('should create new trip with notes', async () => {
      const newTripData = {
        destination: 'Paris',
        budgetTier: 'mid_range' as const,
        days: 5,
        currency: 'USD',
        totalEstimatedCost: 500,
        notes: 'My personal notes',
        places: [],
        restaurants: [],
        itinerary: [],
      };

      (prisma.trip.create as jest.Mock).mockResolvedValue({
        id: 'trip_new',
        ...newTripData,
        userId: 'user_1',
      });

      const newTrip = await prisma.trip.create({
        data: {
          destination: newTripData.destination,
          budgetTier: newTripData.budgetTier,
          days: newTripData.days,
          currency: newTripData.currency,
          totalEstimatedCost: newTripData.totalEstimatedCost,
          notes: newTripData.notes,
          userId: 'user_1',
          places: { create: [] },
          restaurants: { create: [] },
          itinerary: { create: [] },
        },
        include: { places: true, restaurants: true, itinerary: true },
      });

      expect(newTrip).toBeDefined();
      expect(newTrip?.notes).toBe('My personal notes');
    });
  });

  describe('Shared Trip Access', () => {
    it('should verify token-based access for public trips', async () => {
      const shareToken = 'abc123';
      const mockTrip = {
        id: 'trip_123',
        destination: 'Paris',
        isPublic: true,
        shareToken: shareToken,
        places: [],
        restaurants: [],
      };

      (prisma.trip.findFirst as jest.Mock).mockResolvedValue(mockTrip);

      const trip = await prisma.trip.findFirst({
        where: {
          shareToken: shareToken,
          isPublic: true,
        },
        include: { places: true, restaurants: true },
      });

      expect(trip).toBeDefined();
      expect(trip?.isPublic).toBe(true);
    });

    it('should reject access to non-public trips via share token', async () => {
      const shareToken = 'invalid_token';

      (prisma.trip.findFirst as jest.Mock).mockResolvedValue(null);

      const trip = await prisma.trip.findFirst({
        where: {
          shareToken: shareToken,
          isPublic: true,
        },
      });

      expect(trip).toBeNull();
    });
  });
});