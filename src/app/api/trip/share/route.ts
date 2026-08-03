import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tripId, makePublic = false } = body;

    if (!tripId) {
      return NextResponse.json(
        { error: 'Trip ID is required' },
        { status: 400 }
      );
    }

    // Generate a unique share token
    const shareToken = crypto.randomBytes(16).toString('hex');

    // Update the trip with share token
    const trip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        shareToken,
        isPublic: makePublic,
      },
    });

    return NextResponse.json({
      shareToken,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shared/${shareToken}`,
    });
  } catch (error) {
    console.error('Error sharing trip:', error);
    return NextResponse.json(
      { error: 'Failed to share trip' },
      { status: 500 }
    );
  }
}