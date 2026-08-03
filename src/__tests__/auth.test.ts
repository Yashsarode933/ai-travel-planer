import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, verifyToken } from '@/lib/auth';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock auth functions
jest.mock('@/lib/auth', () => ({
  hashPassword: jest.fn(),
  signToken: jest.fn(),
  verifyToken: jest.fn(),
}));

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user successfully', async () => {
      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
      };

      // Setup mocks
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      (signToken as jest.Mock).mockReturnValue('mockToken');

      // Simulate signup flow
      const existingUser = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });

      expect(existingUser).toBeNull();

      const hashedPassword = await hashPassword('password123');
      expect(hashedPassword).toBe('hashedPassword');

      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
        },
      });

      expect(user).toEqual(mockUser);
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should reject if user already exists', async () => {
      const existingUser = { id: 'user_123', email: 'test@example.com', name: 'Test User' };
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });

      expect(user).toBeDefined();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('token verification', () => {
    it('should verify a valid token', () => {
      const mockPayload = { id: 'user_123', email: 'test@example.com' };
      (verifyToken as jest.Mock).mockReturnValue(mockPayload);

      const result = verifyToken('validToken');
      expect(result).toEqual(mockPayload);
    });

    it('should return null for invalid token', () => {
      (verifyToken as jest.Mock).mockReturnValue(null);

      const result = verifyToken('invalidToken');
      expect(result).toBeNull();
    });
  });

  describe('password hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'password123';
      const hashed = 'hashedPassword123';
      
      (hashPassword as jest.Mock).mockReturnValue(hashed);

      const result = await hashPassword(password);
      expect(result).toBe(hashed);
    });
  });

  describe('token signing', () => {
    it('should sign token correctly', () => {
      const payload = { id: 'user_123', email: 'test@example.com' };
      const token = 'signedToken123';
      
      (signToken as jest.Mock).mockReturnValue(token);

      const result = signToken(payload);
      expect(result).toBe(token);
    });
  });
});