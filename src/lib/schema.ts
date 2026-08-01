import { z } from 'zod';

export const BudgetTierSchema = z.enum(['budget', 'mid-range', 'luxury']);

export const PriceRangeSchema = z.enum(['$', '$$', '$$$', '$$$$']);

export const MealTypeSchema = z.enum(['breakfast', 'lunch', 'dinner']);

export const AIPlaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  estimatedCost: z.number().nonnegative(),
  estimatedDurationMinutes: z.number().int().positive(),
  tags: z.array(z.string()),
});

export const AIRestaurantSchema = z.object({
  id: z.string(),
  name: z.string(),
  cuisine: z.string(),
  priceRange: PriceRangeSchema,
  description: z.string(),
  mealType: MealTypeSchema,
});

export const AIItineraryItemSchema = z.object({
  type: z.enum(['place', 'restaurant']),
  refId: z.string(),
  notes: z.string(),
});

export const AIItineraryDaySchema = z.object({
  day: z.number().int().positive(),
  morning: AIItineraryItemSchema,
  afternoon: AIItineraryItemSchema,
  evening: AIItineraryItemSchema,
});

export const AITripResponseSchema = z.object({
  destination: z.string(),
  currency: z.string(),
  budgetTier: BudgetTierSchema,
  totalEstimatedCost: z.number().nonnegative(),
  places: z.array(AIPlaceSchema),
  restaurants: z.array(AIRestaurantSchema),
  itinerary: z.array(AIItineraryDaySchema),
});

// Input schema for trip generation
export const GenerateTripInputSchema = z.object({
  destination: z.string().min(1, 'Destination is required'),
  budgetTier: BudgetTierSchema,
  days: z.number().int().min(1).max(14),
  interests: z.array(z.string()).optional(),
  travelDates: z.string().optional(),
});