import { NextRequest, NextResponse } from 'next/server';
import type { TripWithDetails } from '@/lib/types';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
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

      return NextResponse.json({
        id: trip.id,
        destination: trip.destination,
        budgetTier: trip.budgetTier,
        days: trip.days,
        interests: trip.interests,
        travelDates: trip.travelDates,
        currency: trip.currency,
        totalEstimatedCost: Number(trip.totalEstimatedCost),
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