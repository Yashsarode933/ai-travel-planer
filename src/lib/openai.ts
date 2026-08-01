import OpenAI from 'openai';
import Groq from 'groq-sdk';
import { z } from 'zod';
import {
  AITripResponse,
  BudgetTier,
  GenerateTripInput,
} from './types';
import { AITripResponseSchema } from './schema';

// Configuration - can be set via environment variables
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';
const GROQ_MODEL = 'llama-3.1-70b-toolcall';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// Initialize clients lazily
let openaiClient: OpenAI | null = null;
let groqClient: Groq | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not set in environment variables');
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

// System prompt for travel planning
const TRAVEL_PLANNER_SYSTEM_PROMPT = `You are an expert local travel planner. Given a destination, budget tier, trip length, and interests, generate a realistic, non-touristy-cliché-only itinerary that balances must-see landmarks with authentic local experiences. Respect the budget tier in cost estimates. Group geographically close places on the same day to minimize travel time. Return ONLY valid JSON matching the given schema, no prose.`;

// JSON schema for structured output
const TRIP_SCHEMA = {
  type: 'json_schema' as const,
  json_schema: {
    name: 'trip_planning',
    strict: true,
    schema: {
      type: 'object' as const,
      properties: {
        destination: { type: 'string' },
        currency: { type: 'string' },
        budgetTier: { type: 'string', enum: ['budget', 'mid-range', 'luxury'] },
        totalEstimatedCost: { type: 'number' },
        places: {
          type: 'array' as const,
          items: {
            type: 'object' as const,
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              category: { type: 'string' },
              description: { type: 'string' },
              estimatedCost: { type: 'number' },
              estimatedDurationMinutes: { type: 'number' },
              tags: { type: 'array', items: { type: 'string' } },
            },
            required: ['id', 'name', 'category', 'description', 'estimatedCost', 'estimatedDurationMinutes', 'tags'],
          },
        },
        restaurants: {
          type: 'array' as const,
          items: {
            type: 'object' as const,
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              cuisine: { type: 'string' },
              priceRange: { type: 'string', enum: ['$', '$$', '$$$', '$$$$'] },
              description: { type: 'string' },
              mealType: { type: 'string', enum: ['breakfast', 'lunch', 'dinner'] },
            },
            required: ['id', 'name', 'cuisine', 'priceRange', 'description', 'mealType'],
          },
        },
        itinerary: {
          type: 'array' as const,
          items: {
            type: 'object' as const,
            properties: {
              day: { type: 'integer' },
              morning: {
                type: 'object' as const,
                properties: {
                  type: { type: 'string', enum: ['place', 'restaurant'] },
                  refId: { type: 'string' },
                  notes: { type: 'string' },
                },
                required: ['type', 'refId', 'notes'],
              },
              afternoon: {
                type: 'object' as const,
                properties: {
                  type: { type: 'string', enum: ['place', 'restaurant'] },
                  refId: { type: 'string' },
                  notes: { type: 'string' },
                },
                required: ['type', 'refId', 'notes'],
              },
              evening: {
                type: 'object' as const,
                properties: {
                  type: { type: 'string', enum: ['place', 'restaurant'] },
                  refId: { type: 'string' },
                  notes: { type: 'string' },
                },
                required: ['type', 'refId', 'notes'],
              },
            },
            required: ['day', 'morning', 'afternoon', 'evening'],
          },
        },
      },
      required: ['destination', 'currency', 'budgetTier', 'totalEstimatedCost', 'places', 'restaurants', 'itinerary'],
    },
  },
};

// Helper to get currency based on destination
function getCurrencyForDestination(destination: string): string {
  const destLower = destination.toLowerCase();
  for (const [country, currency] of Object.entries({
    'USA': 'USD',
    'United States': 'USD',
    'India': 'INR',
    'UK': 'GBP',
    'United Kingdom': 'GBP',
    'Europe': 'EUR',
    'Germany': 'EUR',
    'France': 'EUR',
    'Italy': 'EUR',
    'Spain': 'EUR',
    'Japan': 'JPY',
  })) {
    if (destLower.includes(country.toLowerCase())) {
      return currency;
    }
  }
  return 'USD';
}

// Helper to generate cost estimate based on budget tier
function getCostEstimate(budgetTier: BudgetTier, days: number): number {
  const baseCosts: Record<BudgetTier, number> = {
    budget: 50,
    'mid-range': 150,
    luxury: 300,
  };
  return baseCosts[budgetTier] * days;
}

// Build user prompt
function buildUserPrompt(input: GenerateTripInput): string {
  let prompt = `DESTINATION: ${input.destination}

BUDGET TIER: ${input.budgetTier}
- Budget: Up to $50 per person per day
- Mid-range: $100-200 per person per day
- Luxury: $300+ per person per day

TRIP DURATION: ${input.days} days
`;

  if (input.interests && input.interests.length > 0) {
    prompt += `
INTERESTS: ${input.interests.join(', ')}
`;
  }

  if (input.travelDates) {
    prompt += `
TRAVEL DATES: ${input.travelDates}
`;
  }

  prompt += `
Return a JSON object with:
- destination: The destination name
- currency: Appropriate currency code (USD, EUR, INR, etc.)
- budgetTier: The budget tier
- totalEstimatedCost: Total estimated cost in that currency
- places: Array of places to visit (3-5 per day recommended)
- restaurants: Array of restaurants (1-2 meals per day)
- itinerary: Day-by-day schedule

For each place, provide:
- id: A unique identifier
- name: The place name
- category: Type (museum, park, market, historical site, etc.)
- description: Brief description
- estimatedCost: Cost per person in dollars
- estimatedDurationMinutes: Time to spend there
- tags: Relevant tags matching interests

For each restaurant, provide:
- id: A unique identifier
- name: Restaurant name
- cuisine: Type of cuisine
- priceRange: $, $$, $$$, or $$$$
- description: Brief description
- mealType: breakfast, lunch, or dinner

For the itinerary, provide morning/afternoon/evening blocks for each day,
connecting places and restaurants by refId, with travel notes.
`;

  return prompt;
}

// Validate response against schema
function validateResponse(parsed: unknown): AITripResponse {
  const validated = AITripResponseSchema.safeParse(parsed);

  if (!validated.success) {
    console.error('Validation failed:', validated.error);
    throw new Error(`AI response failed validation: ${validated.error.message}`);
  }

  return validated.data;
}

// Parse and validate JSON content
function parseAndValidate(content: string): AITripResponse {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    console.error('Failed to parse AI response:', content);
    throw new Error('Failed to parse AI response as JSON');
  }

  return validateResponse(parsed);
}

// Generate trip using OpenAI
async function generateWithOpenAI(userPrompt: string): Promise<string> {
  const response = await getOpenAIClient().chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: 'system', content: TRAVEL_PLANNER_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    response_format: TRIP_SCHEMA,
    temperature: 0.7,
    max_tokens: 4000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Failed to generate trip plan: No response from OpenAI');
  }

  return content;
}

// Generate trip using Groq
async function generateWithGroq(userPrompt: string): Promise<string> {
  const response = await getGroqClient().chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: TRAVEL_PLANNER_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    response_format: TRIP_SCHEMA,
    temperature: 0.7,
    max_tokens: 4000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Failed to generate trip plan: No response from Groq');
  }

  return content;
}

// Generate trip using the configured provider
export async function generateTripPlan(input: GenerateTripInput): Promise<AITripResponse> {
  const userPrompt = buildUserPrompt(input);

  let content: string;

  if (AI_PROVIDER === 'groq') {
    content = await generateWithGroq(userPrompt);
  } else {
    content = await generateWithOpenAI(userPrompt);
  }

  // Validate response
  try {
    return parseAndValidate(content);
  } catch (validationError) {
    console.error('Validation failed, retrying...', validationError);

    // Retry with error correction - use the appropriate provider-specific function
    const retryContent = AI_PROVIDER === 'groq'
      ? await retryWithGroq(userPrompt, content)
      : await retryWithOpenAI(userPrompt, content);

    if (!retryContent) {
      throw new Error('AI failed to generate valid trip plan after retry');
    }

    return parseAndValidate(retryContent);
  }
}

// Retry with OpenAI
async function retryWithOpenAI(userPrompt: string, previousContent: string): Promise<string> {
  const response = await getOpenAIClient().chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: 'system', content: TRAVEL_PLANNER_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
      {
        role: 'assistant',
        content: previousContent,
      },
      {
        role: 'user',
        content: `The previous response had validation errors. Please fix them and return valid JSON matching the schema exactly.`,
      },
    ],
    response_format: TRIP_SCHEMA,
    temperature: 0.5,
    max_tokens: 4000,
  });

  return response.choices[0]?.message?.content || '';
}

// Retry with Groq
async function retryWithGroq(userPrompt: string, previousContent: string): Promise<string> {
  const response = await getGroqClient().chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: TRAVEL_PLANNER_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
      {
        role: 'assistant',
        content: previousContent,
      },
      {
        role: 'user',
        content: `The previous response had validation errors. Please fix them and return valid JSON matching the schema exactly.`,
      },
    ],
    response_format: TRIP_SCHEMA,
    temperature: 0.5,
    max_tokens: 4000,
  });

  return response.choices[0]?.message?.content || '';
}

// Provider-agnostic interface
export interface TripProvider {
  generateTrip(input: GenerateTripInput): Promise<AITripResponse>;
}

// Export for dependency injection
export const tripProvider: TripProvider = {
  generateTrip: generateTripPlan,
};
