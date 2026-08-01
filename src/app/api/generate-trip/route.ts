import { NextRequest, NextResponse } from 'next/server';
import { generateTripPlan } from '@/lib/openai';
import { GenerateTripInputSchema } from '@/lib/schema';
import type { GenerateTripInput, AITripResponse } from '@/lib/types';
import { enrichPlace, enrichRestaurant } from '@/lib/googlePlaces';

// Simple in-memory rate limiter
const RATE_LIMIT_WINDOW = 60; // seconds
const RATE_LIMIT_MAX = 10; // requests per window
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  
  // Clean up old entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }

  const entry = rateLimitStore.get(ip);
  
  if (!entry) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW * 1000 });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (now > entry.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW * 1000 });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

  // Check rate limit
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429, headers: { 'Retry-After': RATE_LIMIT_WINDOW.toString() } }
    );
  }

  try {
    const body = await request.json();
    
    // Validate input
    const validated = GenerateTripInputSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.message },
        { status: 400 }
      );
    }

    const input = validated.data as GenerateTripInput;

    // Generate trip plan using OpenAI
    const aiResponse = await generateTripPlan(input);

    // Enrich places with Google Maps data
    const enrichedPlaces = [];
    for (const place of aiResponse.places) {
      try {
        const enriched = await enrichPlace(place, aiResponse.destination);
        if (enriched) {
          enrichedPlaces.push(enriched);
        } else {
          // Fallback: use AI-generated data with warning
          enrichedPlaces.push({
            ...place,
            rating: 0,
            reviewCount: 0,
            lat: 0,
            lng: 0,
          });
        }
      } catch (error) {
        console.error(`Error enriching place ${place.name}:`, error);
        enrichedPlaces.push({
          ...place,
          rating: 0,
          reviewCount: 0,
          lat: 0,
          lng: 0,
        });
      }
    }

    // Enrich restaurants with Google Maps data
    const enrichedRestaurants = [];
    for (const restaurant of aiResponse.restaurants) {
      try {
        const enriched = await enrichRestaurant(restaurant, aiResponse.destination);
        if (enriched) {
          enrichedRestaurants.push(enriched);
        } else {
          // Fallback: use AI-generated data
          enrichedRestaurants.push({
            ...restaurant,
            rating: 0,
            reviewCount: 0,
            lat: 0,
            lng: 0,
          });
        }
      } catch (error) {
        console.error(`Error enriching restaurant ${restaurant.name}:`, error);
        enrichedRestaurants.push({
          ...restaurant,
          rating: 0,
          reviewCount: 0,
          lat: 0,
          lng: 0,
        });
      }
    }

    const response: AITripResponse = {
      ...aiResponse,
      places: enrichedPlaces,
      restaurants: enrichedRestaurants,
    };

    return NextResponse.json(response, {
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating trip:', error);
    return NextResponse.json(
      { error: 'Failed to generate trip plan. Please try again.' },
      { status: 500 }
    );
  }
}