# AI Travel Planner

A full-stack web app that lets users input a destination, budget, and trip preferences, then generates a curated list of places to visit, restaurants to try, and a day-by-day itinerary.

## Features

- **Destination Search**: Autocomplete powered by Google Places API
- **Budget Selection**: Choose from Budget, Mid-range, or Luxury tiers
- **AI-Generated Itineraries**: OpenAI GPT-4o or compatible models generate realistic travel plans
- **Places Enrichment**: Google Places API enriches AI output with real photos, ratings, and coordinates
- **Interactive Map**: Visualizes all trip locations on a Google Map
- **Trip Summary**: Displays destination, dates, budget, and estimated costs
- **Save & Export**: Save trips to database (optional) or browser storage

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **AI Integration**: OpenAI API (GPT-4o-mini), easily swappable with Groq/Gemini
- **Maps**: Google Maps JavaScript API + Places API
- **Database**: Prisma ORM with SQLite (local) or PostgreSQL (production)
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key (or compatible alternative)
- Google Maps API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-travel-planer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with:

```bash
# Database (optional - trips saved to localStorage if not set)
DATABASE_URL="file:./dev.db"

# OpenAI API (or set OPENAI_MODEL to use different provider)
OPENAI_API_KEY="your-openai-api-key"

# Google Maps APIs
GOOGLE_MAPS_SERVER_API_KEY="your-server-api-key"
NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_API_KEY="your-browser-api-key"

# Optional: Override the AI model (defaults to gpt-4o-mini)
# OPENAI_MODEL="gpt-4o-mini"
# OPENAI_MODEL="llama-3.1-70b"  # for Groq
```

4. Initialize the database (optional):
```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### API Keys Setup

#### OpenAI API Key
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Add it to `.env.local` as `OPENAI_API_KEY`

#### Google Maps API Key
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create an API key
5. Restrict the key to your domain (optional but recommended)
6. Add both keys to `.env.local`

### Switching AI Providers

The app supports both OpenAI and Groq APIs. Configure via `.env.local`:

#### Using Groq (Free Tier)
```bash
# Set provider to groq
AI_PROVIDER="groq"

# Use Groq API key (get from groq.com)
GROQ_API_KEY="gsk_..."

# Optional: Choose model (defaults to llama-3.1-70b-toolcall)
# OPENAI_MODEL="llama-3.1-70b-toolcall"
# OPENAI_MODEL="llama-3.1-8b-instant"
```

#### Using OpenAI
```bash
# Set provider to openai (default)
AI_PROVIDER="openai"

# Use OpenAI API key
OPENAI_API_KEY="sk-..."

# Optional: Choose model
OPENAI_MODEL="gpt-4o-mini"  # default
OPENAI_MODEL="gpt-4o"
OPENAI_MODEL="gpt-3.5-turbo"
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page with trip form
│   ├── trip/[id]/page.tsx    # Trip results page
│   ├── api/
│   │   ├── generate-trip/route.ts
│   │   ├── enrich-places/route.ts
│   │   └── trip/
│   │       ├── save/route.ts
│   │       └── [id]/route.ts
│   └── layout.tsx
├── components/
│   ├── TripInputForm.tsx     # Main input form with destination, budget, days
│   ├── BudgetSelector.tsx    # Budget tier selection with visual cards
│   ├── DestinationAutocomplete.tsx # Google Places autocomplete
│   ├── TripMap.tsx           # Interactive Google Maps display
│   ├── PlaceCard.tsx         # Individual place card
│   ├── RestaurantCard.tsx    # Individual restaurant card
│   ├── ItineraryDay.tsx      # Day-by-day itinerary display
│   ├── LoadingState.tsx      # Loading animations and progress
│   ├── ExpenseSummary.tsx    # Cost breakdown summary
│   ├── DestinationAutocomplete.tsx # Google Places autocomplete
│   ├── theme-provider.tsx    # Theme provider for dark/light mode
│   └── ui/                   # shadcn/ui component library
├── lib/
│   ├── openai.ts             # AI generation logic (supports OpenAI & Groq)
│   ├── googlePlaces.ts       # Google Maps API helpers
│   ├── schema.ts             # Zod validation schemas
│   ├── types.ts              # TypeScript types
│   └── utils.ts              # Utility functions
└── generated/
    └── prisma/               # Prisma client (generated)
```

## UI Design

The application features a modern, professional UI with:

- **Clean, minimal design**: Uses Tailwind CSS with a light/dark theme system
- **Consistent component styling**: All cards, buttons, and inputs follow a unified design language
- **Gradient backgrounds**: Hero sections use subtle gradients for visual appeal
- **Enhanced cards**: With improved shadow, hover effects, and visual hierarchy
- **Responsive layout**: Adapts to different screen sizes with proper grid systems
- **Professional forms**: Well-organized input forms with proper spacing and icons
- **Interactive elements**: Map with legend, tabbed navigation, and smooth transitions

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate-trip` | POST | Generate a trip plan |
| `/api/enrich-places` | POST | Enrich places with Google Maps data |
| `/api/trip/save` | POST | Save a trip to database |
| `/api/trip/[id]` | GET | Fetch a saved trip |

## Database Schema

The Prisma schema defines:
- `Trip` - Main trip entity with destination, budget, dates
- `Place` - Places to visit with coordinates and ratings
- `Restaurant` - Restaurants with cuisine type and price range
- `Itinerary` - Day-by-day schedule

## Deployment

1. Push to Vercel or your preferred platform
2. Set environment variables in the dashboard
3. Ensure DATABASE_URL is set for production (PostgreSQL recommended)

## License

MIT

## Acknowledgments

- Groq for the AI text generation API
- OpenAI for AI generation compatibility
- Google Maps for location services
- shadcn/ui for beautiful components
- Radix UI for accessible primitives
- Tailwind CSS for styling
