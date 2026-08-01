export type BudgetTier = 'budget' | 'mid-range' | 'luxury';

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export type PriceRange = '$' | '$$' | '$$$' | '$$$$';

export interface AIPlace {
  id: string;
  name: string;
  category: string;
  description: string;
  estimatedCost: number;
  estimatedDurationMinutes: number;
  tags: string[];
}

export interface AIRestaurant {
  id: string;
  name: string;
  cuisine: string;
  priceRange: PriceRange;
  description: string;
  mealType: MealType;
}

export interface AIItineraryItem {
  type: 'place' | 'restaurant';
  refId: string;
  notes: string;
}

export interface AIItineraryDay {
  day: number;
  morning: AIItineraryItem;
  afternoon: AIItineraryItem;
  evening: AIItineraryItem;
}

export interface AITripResponse {
  destination: string;
  currency: string;
  budgetTier: BudgetTier;
  totalEstimatedCost: number;
  places: AIPlace[];
  restaurants: AIRestaurant[];
  itinerary: AIItineraryDay[];
  days?: number;
  interests?: string[];
  travelDates?: string;
}

export interface EnrichedPlace extends AIPlace {
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  photoRef?: string;
  openingHours?: string;
  address?: string;
}

export interface EnrichedRestaurant extends AIRestaurant {
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  photoRef?: string;
  openingHours?: string;
  address?: string;
}

export interface TripSummary {
  id: string;
  destination: string;
  budgetTier: BudgetTier;
  days: number;
  interests: string | null;
  travelDates: string | null;
  currency: string;
  totalEstimatedCost: number;
  createdAt: Date;
}

export interface TripWithDetails {
  id: string;
  destination: string;
  budgetTier: BudgetTier;
  days: number;
  interests: string | null;
  travelDates: string | null;
  currency: string;
  totalEstimatedCost: number;
  places: EnrichedPlace[];
  restaurants: EnrichedRestaurant[];
  itinerary: AIItineraryDay[];
}

export interface GenerateTripInput {
  destination: string;
  budgetTier: BudgetTier;
  days: number;
  interests: string[];
  travelDates?: string;
}

// Interest tags for selection
export const INTEREST_TAGS = [
  'Food',
  'History',
  'Nature',
  'Nightlife',
  'Shopping',
  'Adventure',
  'Art',
  'Culture',
  'Religion',
  'Science',
  'Family',
  'Romance',
  'Wellness',
  'Sports',
] as const;

export type InterestTag = (typeof INTEREST_TAGS)[number];

// Currency lookup by country code
export const CURRENCY_LOOKUP: Record<string, string> = {
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