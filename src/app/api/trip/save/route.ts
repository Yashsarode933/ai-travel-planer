import { NextRequest, NextResponse } from 'next/server';
import type { AITripResponse } from '@/lib/types';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.destination || !body.budgetTier || !body.days) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const tripData = body as AITripResponse;
    const userId = (body as any).userId; // Can be passed from client

    // Try to save to database
    try {
      // Check if we have places/restaurants data
      if (tripData.places && tripData.restaurants && tripData.itinerary) {
        const trip = await prisma.trip.create({
          data: {
            destination: tripData.destination,
            budgetTier: tripData.budgetTier.replace('-', '_') as 'budget' | 'mid_range' | 'luxury',
            days: tripData.days || 0,
            interests: tripData.interests?.join(',') ?? null,
            travelDates: tripData.travelDates ?? null,
            currency: tripData.currency,
            totalEstimatedCost: tripData.totalEstimatedCost,
            userId: userId || undefined,
            places: {
              create: tripData.places.map((place: any) => ({
                name: place.name,
                category: place.category,
                description: place.description,
                estimatedCost: place.estimatedCost,
                estimatedDurationMinutes: place.estimatedDurationMinutes || 60,
                tags: place.tags?.join(',') ?? '',
                rating: place.rating ?? 0,
                reviewCount: place.reviewCount ?? 0,
                lat: place.lat ?? 0,
                lng: place.lng ?? 0,
                photoRef: place.photoRef ?? null,
                openingHours: place.openingHours ?? null,
                address: place.address ?? null,
              })),
            },
            restaurants: {
              create: tripData.restaurants.map((restaurant: any) => {
                const priceRangeMap: Record<string, 'ONE' | 'TWO' | 'THREE' | 'FOUR'> = {
                  '$': 'ONE',
                  '$$': 'TWO',
                  '$$$': 'THREE',
                  '$$$$': 'FOUR'
                };
                return {
                  name: restaurant.name,
                  cuisine: restaurant.cuisine,
                  description: restaurant.description,
                  priceRange: priceRangeMap[restaurant.priceRange as string] || 'ONE',
                  mealType: restaurant.mealType,
                  rating: restaurant.rating ?? 0,
                  reviewCount: restaurant.reviewCount ?? 0,
                  lat: restaurant.lat ?? 0,
                  lng: restaurant.lng ?? 0,
                  photoRef: restaurant.photoRef ?? null,
                  openingHours: restaurant.openingHours ?? null,
                  address: restaurant.address ?? null,
                };
              }),
            },
            itinerary: {
              create: tripData.itinerary.flatMap((dayItinerary: any) => [
                {
                  day: dayItinerary.day,
                  morningType: dayItinerary.morning.type,
                  morningRefId: dayItinerary.morning.refId,
                  morningNotes: dayItinerary.morning.notes,
                  afternoonType: dayItinerary.afternoon.type,
                  afternoonRefId: dayItinerary.afternoon.refId,
                  afternoonNotes: dayItinerary.afternoon.notes,
                  eveningType: dayItinerary.evening.type,
                  eveningRefId: dayItinerary.evening.refId,
                  eveningNotes: dayItinerary.evening.notes,
                },
              ]),
            },
          },
          include: {
            places: true,
            restaurants: true,
            itinerary: true,
          },
        });

        return NextResponse.json({ id: trip.id, saved: true }, { status: 201 });
      }
    } catch (dbError) {
      // Database not configured - this is fine, we'll use localStorage on client
      console.log('Database not configured, using localStorage alternative');
    }

    // Generate a temporary ID for localStorage storage
    const tempId = `temp_${Date.now()}`;
    
    return NextResponse.json({ id: tempId, saved: false, note: 'Saved to browser storage' }, { status: 200 });
  } catch (error) {
    console.error('Error saving trip:', error);
    return NextResponse.json(
      { error: 'Failed to save trip' },
      { status: 500 }
    );
  }
}