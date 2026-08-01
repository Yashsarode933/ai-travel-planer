import { NextRequest, NextResponse } from 'next/server';
import { enrichPlace, enrichRestaurant } from '@/lib/googlePlaces';
import type { AIPlace, AIRestaurant } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.destination || (!body.places && !body.restaurants)) {
      return NextResponse.json(
        { error: 'Missing required fields: destination, and either places or restaurants' },
        { status: 400 }
      );
    }

    const { destination, places, restaurants } = body;

    const enrichedPlaces: AIPlace[] = [];
    const enrichedRestaurants: AIRestaurant[] = [];

    // Enrich places
    if (places && places.length > 0) {
      for (const place of places) {
        try {
          const enriched = await enrichPlace(place, destination);
          if (enriched) {
            enrichedPlaces.push(enriched);
          } else {
            // Return partial data
            enrichedPlaces.push(place);
          }
        } catch (error) {
          console.error(`Error enriching place ${place.name}:`, error);
          enrichedPlaces.push(place);
        }
      }
    }

    // Enrich restaurants
    if (restaurants && restaurants.length > 0) {
      for (const restaurant of restaurants) {
        try {
          const enriched = await enrichRestaurant(restaurant, destination);
          if (enriched) {
            enrichedRestaurants.push(enriched);
          } else {
            enrichedRestaurants.push(restaurant);
          }
        } catch (error) {
          console.error(`Error enriching restaurant ${restaurant.name}:`, error);
          enrichedRestaurants.push(restaurant);
        }
      }
    }

    return NextResponse.json({
      places: enrichedPlaces,
      restaurants: enrichedRestaurants,
    });
  } catch (error) {
    console.error('Error enriching places:', error);
    return NextResponse.json(
      { error: 'Failed to enrich places' },
      { status: 500 }
    );
  }
}