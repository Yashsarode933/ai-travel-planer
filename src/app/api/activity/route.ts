import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get user activities
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const activities = await prisma.userActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to recent 100 activities
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

// Log a user activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, itemId, itemType, metadata } = body;

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'userId and type are required' },
        { status: 400 }
      );
    }

    const activity = await prisma.userActivity.create({
      data: {
        userId,
        type,
        itemId,
        itemType,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error logging activity:', error);
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}