import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    userActivity: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('Activity API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/activity', () => {
    it('should return user activities', async () => {
      const mockActivities = [
        { id: 'act_1', userId: 'user_1', type: 'VIEW', createdAt: new Date() },
        { id: 'act_2', userId: 'user_1', type: 'SAVE', createdAt: new Date() },
      ];

      (prisma.userActivity.findMany as jest.Mock).mockResolvedValue(mockActivities);

      const result = await prisma.userActivity.findMany({
        where: { userId: 'user_1' },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      expect(result).toHaveLength(2);
      expect(prisma.userActivity.findMany).toHaveBeenCalled();
    });
  });

  describe('POST /api/activity', () => {
    it('should log a user activity', async () => {
      const activityData = {
        userId: 'user_1',
        type: 'VIEW' as const,
        itemId: 'trip_1',
        itemType: 'TRIP',
      };

      (prisma.userActivity.create as jest.Mock).mockResolvedValue({
        id: 'act_1',
        createdAt: new Date(),
        ...activityData,
      });

      const result = await prisma.userActivity.create({
        data: activityData,
      });

      expect(result).toBeDefined();
      expect(prisma.userActivity.create).toHaveBeenCalledWith({
        data: activityData,
      });
    });
  });
});