'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AIItineraryDay, EnrichedPlace, EnrichedRestaurant } from '@/lib/types';
import { Coffee, Utensils, MapPin, Clock, Star } from 'lucide-react';

interface ItineraryDayProps {
  day: AIItineraryDay;
  places: EnrichedPlace[];
  restaurants: EnrichedRestaurant[];
}

export function ItineraryDay({ day, places, restaurants }: ItineraryDayProps) {
  // Helper to find item details
  const getPlace = (refId: string): EnrichedPlace | undefined => {
    return places.find(p => p.id === refId);
  };

  const getRestaurant = (refId: string): EnrichedRestaurant | undefined => {
    return restaurants.find(r => r.id === refId);
  };

  const renderBlock = (
    label: string,
    block: { type: 'place' | 'restaurant'; refId: string; notes: string }
  ) => {
    if (block.type === 'place') {
      const place = getPlace(block.refId);
      if (!place) return null;

      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span>{label}</span>
          </div>
          <div className="bg-muted/30 dark:bg-slate-800/50 rounded-xl p-4 border border-border">
            <h5 className="font-semibold text-foreground mb-1">{place.name}</h5>
            <p className="text-sm text-muted-foreground mb-2">{place.description}</p>
            {place.rating > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5 text-xs">
                  <Star className="h-3 w-3 fill-current text-yellow-400" />
                  <span className="font-medium">{place.rating.toFixed(1)}</span>
                </div>
                <Badge variant="outline" className="text-xs border-border">
                  {place.category}
                </Badge>
              </div>
            )}
            {block.notes && (
              <p className="text-xs italic text-muted-foreground mt-2 p-2 bg-white/50 dark:bg-slate-900/50 rounded">
                {block.notes}
              </p>
            )}
          </div>
        </div>
      );
    } else {
      const restaurant = getRestaurant(block.refId);
      if (!restaurant) return null;

      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Coffee className="h-4 w-4 text-amber-500" />
            <span>{label}</span>
          </div>
          <div className="bg-muted/30 dark:bg-slate-800/50 rounded-xl p-4 border border-border">
            <h5 className="font-semibold text-foreground mb-1">{restaurant.name}</h5>
            <p className="text-sm text-muted-foreground mb-2">{restaurant.description}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <Badge variant="outline" className="text-xs border-border">{restaurant.cuisine}</Badge>
              <Badge variant="outline" className="text-xs border-border">{restaurant.priceRange}</Badge>
            </div>
            {block.notes && (
              <p className="text-xs italic text-muted-foreground mt-2 p-2 bg-white/50 dark:bg-slate-900/50 rounded">
                {block.notes}
              </p>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <Card className="mb-6 border-border bg-card hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="border-b border-border bg-muted/30">
        <CardTitle className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20">
            <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">{day.day}</span>
          </div>
          <span>Day</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid gap-4 md:grid-cols-3">
          {renderBlock('Morning', day.morning)}
          {renderBlock('Afternoon', day.afternoon)}
          {renderBlock('Evening', day.evening)}
        </div>
      </CardContent>
    </Card>
  );
}