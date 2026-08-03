'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TripSummary } from '@/components/TripSummary';
import { TripMap } from '@/components/TripMap';
import { PlaceCard } from '@/components/PlaceCard';
import { RestaurantCard } from '@/components/RestaurantCard';
import { ItineraryDay } from '@/components/ItineraryDay';
import { ExpenseSummary } from '@/components/ExpenseSummary';
import { LoadingState } from '@/components/LoadingState';
import { TripWithDetails } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Share2, 
  Heart, 
  RefreshCw, 
  MapPin, 
  Utensils,
  Calendar,
  ArrowLeft,
  Save,
  Edit,
  MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function TripPage() {
  const params = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState<TripWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [tempNotes, setTempNotes] = useState('');

  const tripId = params.id as string;

  useEffect(() => {
    const loadTrip = async () => {
      const load = async (tripData: TripWithDetails | null) => {
        if (tripData) {
          setTrip(tripData);
          setTempNotes(tripData.notes || '');
        }
        setLoading(false);
      };

      // Check if it's a temp trip (from localStorage)
      if (tripId.startsWith('temp_')) {
        const savedTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
        const foundTrip = savedTrips.find((t: TripWithDetails) => t.id === tripId);
        
        if (foundTrip) {
          await load(foundTrip);
        } else {
          // Try to fetch from API
          try {
            const response = await fetch(`/api/trip/${tripId}`);
            if (response.ok) {
              const data = await response.json();
              await load(data);
            } else {
              await load(null);
            }
          } catch (error) {
            console.error('Error fetching trip:', error);
            await load(null);
          }
        }
        return;
      }

      // Try to fetch from API
      try {
        const response = await fetch(`/api/trip/${tripId}`);
        if (response.ok) {
          const data = await response.json();
          await load(data);
        } else {
          // Try localStorage as fallback
          const savedTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
          const foundTrip = savedTrips.find((t: TripWithDetails) => t.id === tripId);
          if (foundTrip) {
            await load(foundTrip);
          } else {
            await load(null);
          }
        }
      } catch (error) {
        console.error('Error fetching trip:', error);
        await load(null);
      }
    };

    loadTrip();
  }, [tripId]);

  const handleRegenerate = () => {
    router.push('/');
  };

  const handleSave = async () => {
    if (!trip) return;

    try {
      const response = await fetch('/api/trip/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trip),
      });

      if (response.ok) {
        const { id } = await response.json();
        // Update the trip ID
        setTrip(prev => prev ? { ...prev, id } : null);
      }
    } catch (error) {
      console.error('Error saving trip:', error);
    }
  };

  const handleExport = async () => {
    if (!trip) return;

    try {
      // Import jsPDF dynamically to avoid SSR issues
      const { exportTripToPDFFromHTML } = await import('@/lib/pdfExport');
      exportTripToPDFFromHTML(trip);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF. Please try again.');
    }
  };

  const handleShare = () => {
    if (navigator.share && trip) {
      navigator.share({
        title: `My Trip to ${trip.destination}`,
        text: `Check out my AI-generated travel plan to ${trip.destination}!`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleUpdateNotes = async () => {
    if (!trip) return;

    try {
      const updatedTrip = { ...trip, notes: tempNotes };
      setTrip(updatedTrip);

      // Also save to API if already saved
      if (!trip.id.startsWith('temp_')) {
        const response = await fetch(`/api/trip/${trip.id}`);
        // Note: In a real app, you'd have a PATCH endpoint
        // For now, we just update locally and save on next explicit save
      }

      setNotesDialogOpen(false);
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Trip Not Found</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            The trip could not be loaded. It may have been deleted or the link is invalid.
          </p>
          <Button asChild>
            <Link href="/">Create a New Trip</Link>
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
            <span className="hidden sm:inline">New Trip</span>
          </Button>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" onClick={handleRegenerate} aria-label="Regenerate trip">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Add to favorites">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Share trip">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleExport} aria-label="Export PDF">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSave} aria-label="Save trip">
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Trip Summary */}
        <TripSummary trip={trip} />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8">
          <Button onClick={handleSave} className="cursor-pointer">
            <Heart className="mr-2 h-4 w-4" />
            Save Trip
          </Button>
          <Button variant="outline" onClick={handleShare} className="cursor-pointer">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" onClick={handleExport} className="cursor-pointer">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="cursor-pointer">
                <MessageCircle className="mr-2 h-4 w-4" />
                Add Notes
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Trip Notes</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="trip-notes">Personal notes for this trip to {trip.destination}</Label>
                  <Textarea
                    id="trip-notes"
                    placeholder="Add your personal notes, reminders, or things to remember..."
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    className="mt-2"
                    rows={5}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateNotes}>
                    Save Notes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {trip.notes && (
          <Card className="mb-6 border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Your Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground whitespace-pre-wrap">{trip.notes}</p>
            </CardContent>
          </Card>
        )}

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
            {trip.places.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Places to Visit</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trip.places.map((place) => (
                    <PlaceCard key={place.id} place={place} />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No places found for this trip.</p>
            )}
          </TabsContent>

          <TabsContent value="restaurants">
            {trip.restaurants.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Restaurants to Try</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trip.restaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No restaurants found for this trip.</p>
            )}
          </TabsContent>
        </Tabs>

        {/* Cost Breakdown */}
        <Card className="mt-8 border-border bg-card">
          <CardHeader className="bg-muted/30 border-b border-border">
            <CardTitle>Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ExpenseSummary
              places={trip.places}
              restaurants={trip.restaurants}
              budgetTier={trip.budgetTier}
              currency={trip.currency}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}