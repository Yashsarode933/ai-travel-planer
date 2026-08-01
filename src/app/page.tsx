import { TripInputForm } from '@/components/TripInputForm';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              AI-Powered Trip Planning
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6">
              <span className="block">Create Your Perfect</span>
              <span className="block text-gradient bg-clip-text text-transparent">
                Travel Experience
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Enter your destination and budget, and let our AI create a customized itinerary
              with must-see places, authentic restaurants, and a day-by-day travel plan.
            </p>
          </div>

          {/* Trip Form */}
          <div className="max-w-2xl mx-auto">
            <TripInputForm />
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 -translate-x-1/2 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 dark:bg-blue-900/20" />
        <div className="absolute bottom-0 right-1/4 translate-x-1/2 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-50 dark:bg-emerald-900/20" />
        <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-amber-100 rounded-full blur-2xl opacity-30 dark:bg-amber-900/10" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get a personalized travel plan in seconds using AI-powered recommendations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              number={1}
              title="Enter Your Trip Details"
              description="Tell us where you want to go, your budget, how long you're traveling, and what interests you."
            />
            <FeatureCard 
              number={2}
              title="AI Generates Your Plan"
              description="Our AI analyzes popular destinations and finds the best places and restaurants matched to your preferences."
            />
            <FeatureCard 
              number={3}
              title="Explore & Save"
              description="View your interactive map, read detailed itineraries, save your trip, and start planning your adventure."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <StatCard value="50+" label="Destinations Covered" />
            <StatCard value="10k+" label="Happy Travelers" />
            <StatCard value="4.9" label="Average Rating" />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="text-center group">
      <div className="relative inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-white dark:bg-slate-800 rounded-full shadow-lg shadow-blue-100 dark:shadow-blue-900/20 group-hover:scale-105 transition-transform duration-300">
        <span className="absolute -top-2 -right-2 flex h-5 w-5">
          <span className="append-patch flex h-full w-full rounded-full bg-blue-100 dark:bg-blue-900 shadow-md" />
        </span>
        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{number}</span>
      </div>
      <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-lg">
      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{value}</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
}