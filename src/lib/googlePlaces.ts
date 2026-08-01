import axios from 'axios';
import { AIPlace, AIRestaurant, EnrichedPlace, EnrichedRestaurant } from './types';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_SERVER_API_KEY;

// Geocoding response types
interface GeocodingResult {
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  formatted_address: string;
}

interface GeocodingResponse {
  results: GeocodingResult[];
  status: string;
}

// Place search response types
interface PlaceResult {
  place_id: string;
  name: string;
  geom: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  photo?: {
  reference: string;
  };
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  vicinity?: string;
  formatted_address?: string;
}

interface PlacesSearchResponse {
  candidates: PlaceResult[];
  status: string;
}

// Fix the axios response type - it wraps the data
interface PlaceApiResponse {
  candidates: PlaceResult[];
  status: string;
}

// Currency lookup
const CURRENCY_LOOKUP: Record<string, string> = {
  US: 'USD',
  UK: 'GBP',
  IN: 'INR',
  EU: 'EUR',
  JP: 'JPY',
  CN: 'CNY',
  AU: 'AUD',
  CA: 'CAD',
  MX: 'MXN',
  BR: 'BRL',
  FR: 'EUR',
  DE: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  KR: 'KRW',
  SG: 'SGD',
  TH: 'THB',
  ID: 'IDR',
  PH: 'PHP',
  VN: 'VND',
  MY: 'MYR',
  AR: 'ARS',
  ZA: 'ZAR',
  RU: 'RUB',
  TR: 'TRY',
  IL: 'ILS',
  AE: 'AED',
  SA: 'SAR',
  NG: 'NGN',
  KE: 'KES',
  EG: 'EGP',
};

/**
 * Geocode a destination string to get coordinates
 */
export async function geocodeDestination(destination: string): Promise<{ lat: number; lng: number; formattedAddress: string } | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('GOOGLE_MAPS_SERVER_API_KEY not set');
    return null;
  }

  try {
    const response = await axios.get<GeocodingResponse>(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          address: destination,
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (response.data.status !== 'OK' || response.data.results.length === 0) {
      return null;
    }

    const result = response.data.results[0];
    return {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      formattedAddress: result.formatted_address,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Get photo URL from photo reference
 */
export async function getPhotoUrl(photoRef: string, maxWidth = 400): Promise<string | null> {
  if (!GOOGLE_MAPS_API_KEY) return null;

  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoRef}&key=${GOOGLE_MAPS_API_KEY}`;
}

/**
 * Find a place by name and destination using Google Places API
 */
export async function findPlace(
  name: string,
  destination: string,
  type: 'establishment' | 'geocode' = 'establishment'
): Promise<PlaceResult | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('GOOGLE_MAPS_SERVER_API_KEY not set');
    return null;
  }

  try {
    const response = await axios.get<PlaceApiResponse>(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`,
      {
        params: {
          input: `${name}, ${destination}`,
          inputtype: 'textquery',
          fields: 'place_id,name,geometry,rating,user_ratings_total,photos,opening_hours,vicinity',
          type: type,
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (response.data.candidates.length === 0) {
      return null;
    }

    return response.data.candidates[0];
  } catch (error) {
    console.error(`Find place error for ${name}:`, error);
    return null;
  }
}

/**
 * Enrich a place with Google Maps data
 */
export async function enrichPlace(place: AIPlace, destination: string): Promise<EnrichedPlace | null> {
  const googlePlace = await findPlace(place.name, destination);

  if (!googlePlace) {
    console.warn(`Could not find place: ${place.name}`);
    return null;
  }

  const enriched: EnrichedPlace = {
    ...place,
    lat: googlePlace.geom.location.lat,
    lng: googlePlace.geom.location.lng,
    rating: googlePlace.rating ?? 0,
    reviewCount: googlePlace.user_ratings_total ?? 0,
    photoRef: googlePlace.photo?.reference,
    openingHours: googlePlace.opening_hours?.weekday_text?.join(', ') ?? 'Hours not available',
    address: googlePlace.vicinity ?? googlePlace.formatted_address ?? '',
  };

  return enriched;
}

/**
 * Enrich a restaurant with Google Maps data
 */
export async function enrichRestaurant(restaurant: AIRestaurant, destination: string): Promise<EnrichedRestaurant | null> {
  const googlePlace = await findPlace(`${restaurant.name} ${restaurant.cuisine}`, destination);

  if (!googlePlace) {
    console.warn(`Could not find restaurant: ${restaurant.name}`);
    return null;
  }

  const enriched: EnrichedRestaurant = {
    ...restaurant,
    lat: googlePlace.geom.location.lat,
    lng: googlePlace.geom.location.lng,
    rating: googlePlace.rating ?? 0,
    reviewCount: googlePlace.user_ratings_total ?? 0,
    photoRef: googlePlace.photo?.reference,
    openingHours: googlePlace.opening_hours?.weekday_text?.join(', ') ?? 'Hours not available',
    address: googlePlace.vicinity ?? googlePlace.formatted_address ?? '',
  };

  return enriched;
}

/**
 * Convert price range enum to display format
 */
export function priceRangeToDisplay(range: '$' | '$$' | '$$$' | '$$$$'): string {
  return range;
}

/**
 * Get currency for a destination
 */
export function getCurrencyForDestination(destination: string): string {
  const destLower = destination.toLowerCase();

  for (const [country, currency] of Object.entries(CURRENCY_LOOKUP)) {
    if (destLower.includes(country.toLowerCase())) {
      return currency;
    }
  }

  return 'USD';
}