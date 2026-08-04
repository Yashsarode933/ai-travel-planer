'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TripMap } from '@/components/TripMap';
import { PlaceCard } from '@/components/PlaceCard';
import { RestaurantCard } from '@/components/RestaurantCard';
import { ItineraryDay } from '@/components/ItineraryDay';
import { TripSummary } from '@/components/TripSummary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Share2, Download, ArrowLeft, MapPin, Utensils, Calendar, MessageCircle } from 'lucide-react';
import { TripWithDetails } from '@/lib/types';
import { LoadingState } from '@/components/LoadingState';

export default function SharedTripPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [trip, setTrip] = useState<TripWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!token) return;

    const loadSharedTrip = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/trip/shared/${token}`);
        if (response.ok) {
          const data = await response.json();
          setTrip(data);
        } else {
          // Trip not found or not public
          setTrip(null);
        }
      } catch (error) {
        console.error('Error loading shared trip:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSharedTrip();
  }, [token]);

  const handleShare = () => {
    if (navigator.share && trip) {
      navigator.share({
        title: `Shared Trip: ${trip.destination}`,
        text: `Check out this shared trip plan!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleExport = () => {
    alert('PDF export would be implemented here');
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4 max-w-md">
          <h2 className="text-3xl font-bold mb-4">Trip Not Found</h2>
          <p className="text-muted-foreground mb-6">
            This shared link is invalid or the trip is no longer available.
          </p>
          <Button asChild>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <Button variant="ghost" asChild>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Trips
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Share trip">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleExport} aria-label="Export PDF">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Personal Notes (if exists) */}
        {trip.notes && (
          <Card className="mb-6 border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Creator's Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground whitespace-pre-wrap">{trip.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Trip Summary (Public View) */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h1 className="text-3xl font-bold mb-2">{trip.destination}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                {trip.budgetTier}
              </span>
              <span>{trip.days} days</span>
              <span>{trip.currency} {Math.round(trip.totalEstimatedCost).toLocaleString()} budget</span>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="places">Places ({trip.places.length})</TabsTrigger>
            <TabsTrigger value="restaurants">Eats ({trip.restaurants.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {trip.itinerary.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Day-by-Day Itinerary</h2>
                {trip.itinerary.map((day) => (
                  <ItineraryDay 
                    key={day.day} 
                    day={day} 
                    places={trip.places} 
                    restaurants={trip.restaurants} 
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="map">
            <TripMap
              places={trip.places}
              restaurants={trip.restaurants}
              itinerary={trip.itinerary}
              destination={trip.destination}
            />
          </TabsContent>

          <TabsContent value="places">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Places to Visit</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trip.places.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="restaurants">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Restaurants to Try</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trip.restaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Cost Breakdown */}
        <Card className="mt-8 border-border bg-card">
          <CardHeader className="bg-muted/30 border-b border-border">
            <CardTitle>Trip Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{trip.days}</p>
                <p className="text-sm text-muted-foreground">Days</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{trip.places.length}</p>
                <p className="text-sm text-muted-foreground">Places</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{trip.restaurants.length}</p>
                <p className="text-sm text-muted-foreground">Restaurants</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}