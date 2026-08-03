import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get user favorites
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { addedAt: 'desc' },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

// Add or remove a favorite
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, itemId } = body;

    if (!userId || !type || !itemId) {
      return NextResponse.json(
        { error: 'userId, type, and itemId are required' },
        { status: 400 }
      );
    }

    // Check if already favorited - use findMany instead of findUnique due to composite key
    const existing = await prisma.favorite.findFirst({
      where: {
        userId,
        type: type as any,
        itemId,
      },
    });

    if (existing) {
      // Remove favorite
      await prisma.favorite.delete({
        where: {
          id: existing.id,
        },
      });
      return NextResponse.json({ favorited: false });
    }

    // Add favorite
    await prisma.favorite.create({
      data: {
        userId,
        type: type as any,
        itemId,
      },
    });

    return NextResponse.json({ favorited: true });
  } catch (error) {
    console.error('Error updating favorite:', error);
    return NextResponse.json(
      { error: 'Failed to update favorite' },
      { status: 500 }
    );
  }
}

// Delete a favorite
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const type = request.nextUrl.searchParams.get('type') as string;
    const itemId = request.nextUrl.searchParams.get('itemId');

    if (!userId || !type || !itemId) {
      return NextResponse.json(
        { error: 'userId, type, and itemId are required' },
        { status: 400 }
      );
    }

    const favorite = await prisma.favorite.findFirst({
      where: {
        userId,
        type: type as any,
        itemId,
      },
    });

    if (favorite) {
      await prisma.favorite.delete({
        where: {
          id: favorite.id,
        },
      });
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Error deleting favorite:', error);
    return NextResponse.json(
      { error: 'Failed to delete favorite' },
      { status: 500 }
    );
  }
}