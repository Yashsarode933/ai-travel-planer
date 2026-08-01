'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DestinationAutocomplete } from '@/components/DestinationAutocomplete';
import { BudgetSelector } from '@/components/BudgetSelector';
import { INTEREST_TAGS, GenerateTripInput, TripWithDetails, BudgetTier } from '@/lib/types';
import { Loader2, Calendar, MapPin, Tag } from 'lucide-react';

interface TripInputFormProps {
  onTripGenerated?: (trip: TripWithDetails) => void;
}

export function TripInputForm({ onTripGenerated }: TripInputFormProps) {
  const router = useRouter();
  
  const [destination, setDestination] = useState('');
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('mid-range');
  const [days, setDays] = useState(3);
  const [interests, setInterests] = useState<string[]>([]);
  const [travelDates, setTravelDates] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [geocodedCoords, setGeocodedCoords] = useState<{ lat: number; lng: number } | null>(null);

  const handleGenerateTrip = async () => {
    if (!destination || !budgetTier) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const input: GenerateTripInput = {
        destination,
        budgetTier,
        days,
        interests,
        travelDates: travelDates || undefined,
      };

      const response = await fetch('/api/generate-trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate trip');
      }

      const tripData = await response.json();
      
      // Create a temporary ID for the trip
      const temporaryId = `temp_${Date.now()}`;
      
      const trip: TripWithDetails = {
        id: temporaryId,
        ...tripData,
        places: tripData.places.map((p: any) => ({ ...p, estimatedDurationMinutes: 0 })),
      };

      // Save to localStorage for now (can be enhanced to save to DB)
      const savedTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
      savedTrips.unshift(trip);
      localStorage.setItem('savedTrips', JSON.stringify(savedTrips.slice(0, 10)));

      if (onTripGenerated) {
        onTripGenerated(trip);
      } else {
        router.push(`/trip/${temporaryId}`);
      }
    } catch (err) {
      console.error('Error generating trip:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate trip');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest) 
        : [...prev, interest]
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl border-border bg-card">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl">Plan Your Trip</CardTitle>
        <CardDescription className="text-muted-foreground">
          Tell us about your travel plans and we'll create a personalized itinerary
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="destination" className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Destination *
          </Label>
          <DestinationAutocomplete
            value={destination}
            onChange={setDestination}
            onGeocode={(lat, lng) => setGeocodedCoords({ lat, lng })}
          />
        </div>

        <BudgetSelector
          value={budgetTier}
          onChange={setBudgetTier}
        />

        <div className="space-y-2">
          <Label htmlFor="days" className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Trip Duration (days) *
          </Label>
          <div className="relative">
            <Input
              id="days"
              type="number"
              min={1}
              max={14}
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value) || 1)}
              className="pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              days
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Choose between 1 and 14 days
          </p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            Interests (optional)
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            Select tags that match what you're interested in
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {INTEREST_TAGS.map((interest) => (
              <div key={interest} className="flex items-center space-x-2">
                <Checkbox
                  id={interest}
                  checked={interests.includes(interest)}
                  onCheckedChange={() => toggleInterest(interest)}
                />
                <Label htmlFor={interest} className="text-sm font-normal cursor-pointer">
                  {interest}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="travelDates" className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Travel Dates (optional)
          </Label>
          <div className="relative">
            <Input
              id="travelDates"
              type="date"
              value={travelDates}
              onChange={(e) => setTravelDates(e.target.value)}
              className="pl-10"
            />
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">
            Helps us provide weather-aware recommendations
          </p>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}

        <Button 
          type="submit" 
          onClick={handleGenerateTrip}
          disabled={loading || !destination || !budgetTier}
          className="w-full h-12 text-base font-medium"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating Your Trip...
            </>
          ) : (
            'Generate My Trip'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}