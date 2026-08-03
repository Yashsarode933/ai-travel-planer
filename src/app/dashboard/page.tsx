'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TripSummary } from '@/components/TripSummary';
import { LoadingState } from '@/components/LoadingState';
import { Plus, Heart, MapPin, Calendar, DollarSign, Utensils } from 'lucide-react';
import Image from 'next/image';

interface TripPreview {
  id: string;
  destination: string;
  budgetTier: string;
  days: number;
  currency: string;
  totalEstimatedCost: number;
  createdAt: string;
  places?: Array<{ name: string; category: string; rating?: number; photoRef?: string }>;
  restaurants?: Array<{ name: string; cuisine: string; priceRange?: string }>;
}

interface TripDashboardProps {
  initialTrips?: TripPreview[];
}

export function TripDashboard({ initialTrips = [] }: TripDashboardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [trips, setTrips] = useState<TripPreview[]>(initialTrips);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    // Load user's trips from localStorage or API
    const loadTrips = async () => {
      setLoading(true);
      try {
        // Try to fetch from localStorage first
        const savedTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
        
        // Filter to only user's trips
        const userTrips = savedTrips.filter((t: TripPreview) => !t.id.startsWith('temp_'));
        setTrips(userTrips);
      } catch (error) {
        console.error('Error loading trips:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrips();
  }, [isAuthenticated, isLoading, router]);

  const handleNewTrip = () => {
    router.push('/');
  };

  if (isLoading || loading) {
    return <LoadingState />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your trips</h2>
          <Button asChild>
            <Link href="/">Create a Trip</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Trips</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.name || user.email}
            </p>
          </div>
          <Button onClick={handleNewTrip} className="h-11">
            <Plus className="h-5 w-5 mr-2" />
            New Trip
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard value={trips.length} label="Total Trips" icon={MapPin} />
          <StatCard value={trips.reduce((sum, t) => sum + t.days, 0)} label="Total Days" icon={Calendar} />
          <StatCard 
            value={trips.reduce((sum, t) => sum + (t.totalEstimatedCost || 0), 0)} 
            label="Total Budget" 
            prefix="$"
            icon={DollarSign} 
          />
          <StatCard value={trips.filter(t => t.places?.length).length} label="With Places" icon={Heart} />
        </div>

        {/* Trips Grid */}
        {trips.length === 0 ? (
          <Card className="border-border">
            <CardContent className="pt-8 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No trips yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first trip to see it here
              </p>
              <Button onClick={handleNewTrip}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Trip
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Link key={trip.id} href={`/trip/${trip.id}`} className="block group">
                <Card className="hover:shadow-xl transition-all duration-300 border-border bg-card">
                  <CardHeader className="p-0">
                    <div className="relative aspect-[16/9]">
                      {trip.places?.[0]?.name ? (
                        <Image
                          src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${trip.places[0].photoRef}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_API_KEY}`}
                          alt={trip.destination}
                          fill
                          sizes="(max-width: 768px) 100vw, 400px"
                          className="object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.png';
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-emerald-50">
                          <MapPin className="h-8 w-8 text-blue-500" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <CardTitle className="text-lg leading-tight mb-2">
                      {trip.destination}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                        {trip.budgetTier}
                      </span>
                      <span>*</span>
                      <span>{trip.days} days</span>
                    </div>
                    {trip.places && trip.places.length > 0 && (
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Utensils className="h-4 w-4" />
                          <span>{trip.restaurants?.length || 0} restaurants</span>
                        </div>
                        <div className="text-xs">
                          Est. budget: {trip.currency} {Math.round(trip.totalEstimatedCost).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ 
  value, 
  label, 
  icon: Icon, 
  prefix = '',
  suffix = '' 
}: { 
  value: number | string; 
  label: string; 
  icon: any; 
  prefix?: string; 
  suffix?: string; 
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 text-center">
      <div className="flex items-center justify-center mb-2">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="text-2xl font-bold text-foreground">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

export default TripDashboard;