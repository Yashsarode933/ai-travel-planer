import { NextRequest, NextResponse } from 'next/server';
import type { TripWithDetails } from '@/lib/types';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Helper to verify authentication
async function getAuthenticatedUser(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  let token: string | null = null;
  
  if (authorization && authorization.startsWith('Bearer ')) {
    token = authorization.split(' ')[1];
  } else {
    token = request.cookies.get('token')?.value || null;
  }
  
  if (!token) {
    return null;
  }
  
  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }
  
  const user = await prisma.user.findUnique({
    where: { id: payload.id },
  });
  
  return user;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    // Verify authentication
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Trip ID is required' },
        { status: 400 }
      );
    }

    // Check if it's a temp ID
    if (id.startsWith('temp_')) {
      return NextResponse.json(
        { error: 'Temporary trips cannot be updated via API' },
        { status: 400 }
      );
    }

    // Check if trip exists
    const existingTrip = await prisma.trip.findUnique({
      where: { id },
    });

    if (!existingTrip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (existingTrip.userId !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this trip' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { notes, interests, travelDates, totalEstimatedCost } = body;

    // Update trip
    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: {
        notes: notes ?? existingTrip.notes,
        interests: interests ?? existingTrip.interests,
        travelDates: travelDates ?? existingTrip.travelDates,
        totalEstimatedCost: totalEstimatedCost ?? existingTrip.totalEstimatedCost,
      },
      include: {
        places: true,
        restaurants: true,
      },
    });

    return NextResponse.json(updatedTrip);
  } catch (error) {
    console.error('Error updating trip:', error);
    return NextResponse.json(
      { error: 'Failed to update trip' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    // Verify authentication
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Trip ID is required' },
        { status: 400 }
      );
    }

    // Check if it's a temp ID - cannot delete
    if (id.startsWith('temp_')) {
      return NextResponse.json(
        { error: 'Temporary trips cannot be deleted via API' },
        { status: 400 }
      );
    }

    // Check if trip exists and belongs to user
    const existingTrip = await prisma.trip.findUnique({
      where: { id },
    });

    if (!existingTrip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (existingTrip.userId !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this trip' },
        { status: 403 }
      );
    }

    // Delete trip (cascade deletes places, restaurants, and itinerary)
    await prisma.trip.delete({
      where: { id },
    });

    return NextResponse.json({ 
      deleted: true, 
      message: 'Trip deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting trip:', error);
    return NextResponse.json(
      { error: 'Failed to delete trip' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    if (!id) {
      return NextResponse.json(
        { error: 'Trip ID is required' },
        { status: 400 }
      );
    }

    // Check if it's a temp ID (from localStorage on client)
    if (id.startsWith('temp_')) {
      return NextResponse.json(
        { 
          error: 'Temporary trip not persisted. Set up Prisma database for persistence.',
          id,
          note: 'Trip data exists in browser localStorage only'
        },
        { status: 404 }
      );
    }

    // Try database first
    try {
      const trip = await prisma.trip.findUnique({
        where: { id },
        include: {
          places: true,
          restaurants: true,
        },
      });

      if (!trip) {
        return NextResponse.json(
          { error: 'Trip not found' },
          { status: 404 }
        );
      }

      // Fetch itinerary entries
      const itineraryEntries = await prisma.itinerary.findMany({
        where: { tripId: id },
        orderBy: { day: 'asc' },
      });

      // Build response
      const dayMap = new Map<number, any>();
      for (const entry of itineraryEntries) {
        if (!dayMap.has(entry.day)) {
          dayMap.set(entry.day, {
            day: entry.day,
            morning: {
              type: entry.morningType,
              refId: entry.morningRefId,
              notes: entry.morningNotes || '',
            },
            afternoon: {
              type: entry.afternoonType,
              refId: entry.afternoonRefId,
              notes: entry.afternoonNotes || '',
            },
            evening: {
              type: entry.eveningType,
              refId: entry.eveningRefId,
              notes: entry.eveningNotes || '',
            },
          });
        }
      }

      const itinerary = Array.from(dayMap.values()).sort((a: any, b: any) => a.day - b.day);

      // Check if trip is public or user is authenticated owner
      const isAuthenticated = await getAuthenticatedUser(request);
      const isOwner = isAuthenticated && trip.userId === isAuthenticated.id;
      const canAccess = trip.isPublic || isOwner;

      if (!canAccess) {
        return NextResponse.json(
          { error: 'Access denied. This trip is private.' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        id: trip.id,
        destination: trip.destination,
        budgetTier: trip.budgetTier,
        days: trip.days,
        interests: trip.interests,
        travelDates: trip.travelDates,
        currency: trip.currency,
        totalEstimatedCost: Number(trip.totalEstimatedCost),
        notes: trip.notes,
        places: trip.places.map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          description: p.description,
          estimatedCost: Number(p.estimatedCost),
          estimatedDurationMinutes: 0,
          tags: p.tags ? p.tags.split(',') : [],
          rating: Number(p.rating),
          reviewCount: Number(p.reviewCount),
          lat: Number(p.lat),
          lng: Number(p.lng),
          photoRef: p.photoRef,
          openingHours: p.openingHours,
          address: p.address,
          notes: p.notes,
        })),
        restaurants: trip.restaurants.map((r: any) => {
          const priceRangeMap: Record<string, string> = {
            ONE: '$',
            TWO: '$$',
            THREE: '$$$',
            FOUR: '$$$$'
          };
          return {
            id: r.id,
            name: r.name,
            cuisine: r.cuisine,
            priceRange: priceRangeMap[r.priceRange as string] || '$',
            description: r.description,
            mealType: r.mealType,
            rating: Number(r.rating),
            reviewCount: Number(r.reviewCount),
            lat: Number(r.lat),
            lng: Number(r.lng),
            photoRef: r.photoRef,
            openingHours: r.openingHours,
            address: r.address,
            notes: r.notes,
          };
        }),
        itinerary,
      } as TripWithDetails);
    } catch (dbError) {
      // Database not configured - return explanation
      return NextResponse.json(
        { 
          error: 'Database not configured.',
          help: 'Set up Prisma with a DATABASE_URL to enable trip persistence.',
          id
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error fetching trip:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trip' },
      { status: 500 }
    );
  }
}