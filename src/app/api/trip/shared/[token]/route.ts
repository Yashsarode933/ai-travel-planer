import { NextRequest, NextResponse } from 'next/server';
import type { TripWithDetails } from '@/lib/types';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  try {
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Find the trip by share token and ensure it's public
    const trip = await prisma.trip.findFirst({
      where: {
        shareToken: token,
        isPublic: true,
      },
      include: {
        places: true,
        restaurants: true,
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Shared trip not found or is not public' },
        { status: 404 }
      );
    }

    // Fetch itinerary entries
    const itineraryEntries = await prisma.itinerary.findMany({
      where: { tripId: trip.id },
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
  } catch (error) {
    console.error('Error fetching shared trip:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared trip' },
      { status: 500 }
    );
  }
}