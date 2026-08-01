'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TripWithDetails } from '@/lib/types';
import { Calendar, MapPin, DollarSign, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface TripSummaryProps {
  trip: TripWithDetails;
}

const budgetTierConfig: Record<string, { color: string; label: string; icon: string }> = {
  'budget': { color: 'green', label: 'Budget', icon: '🎯' },
  'mid-range': { color: 'blue', label: 'Mid-range', icon: '🏨' },
  'luxury': { color: 'purple', label: 'Luxury', icon: '🏰' },
};

export function TripSummary({ trip }: TripSummaryProps) {
  const budgetConfig = budgetTierConfig[trip.budgetTier] || { color: 'gray', label: 'Standard', icon: '✈️' };
  
  return (
    <Card className="mb-6 border-border bg-card">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 border-b border-border">
        <CardTitle className="text-2xl text-foreground">Trip Summary</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-4 p-4 bg-muted/30 dark:bg-slate-800/50 rounded-xl">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Destination</p>
              <p className="font-semibold text-lg text-foreground">{trip.destination}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-muted/30 dark:bg-slate-800/50 rounded-xl">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Badge 
                variant="outline" 
                className={`text-xs border-${budgetConfig.color}-500/50 bg-${budgetConfig.color}-50/50 dark:bg-${budgetConfig.color}-900/20`}
              >
                <span className="mr-1">{budgetConfig.icon}</span>
                {trip.budgetTier}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Budget Tier</p>
              <p className="font-semibold capitalize text-lg text-foreground">{trip.budgetTier}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-muted/30 dark:bg-slate-800/50 rounded-xl">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Duration</p>
              <p className="font-semibold text-lg text-foreground">
                {trip.days} {trip.days === 1 ? 'day' : 'days'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-muted/30 dark:bg-slate-800/50 rounded-xl">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Est. Total Cost</p>
              <p className="font-semibold text-lg text-foreground">
                {trip.currency} {trip.totalEstimatedCost.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {trip.interests && (
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground font-medium mb-3">Interests</p>
            <div className="flex flex-wrap gap-2">
              {trip.interests.split(',').map((interest) => (
                <Badge key={interest} variant="secondary" className="text-xs">
                  {interest.trim()}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {trip.travelDates && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground font-medium mb-1">Travel Dates</p>
            <p className="font-medium text-foreground">
              {format(parseISO(trip.travelDates), 'EEEE, MMMM do, yyyy')}
            </p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{trip.places.length}</p>
              <p className="text-xs text-muted-foreground">Places</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{trip.restaurants.length}</p>
              <p className="text-xs text-muted-foreground">Restaurants</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{trip.itinerary.length}</p>
              <p className="text-xs text-muted-foreground">Days</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}