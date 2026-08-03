'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EnrichedRestaurant } from '@/lib/types';
import { Star, MapPin, Clock, DollarSign, Heart } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface RestaurantCardProps {
  restaurant: EnrichedRestaurant;
  isFavorite?: boolean;
  onFavoriteToggle?: (isFavorite: boolean) => void;
}

const priceRangeLabels: Record<string, string> = {
  '$': '$',
  '$$': '$$',
  '$$$': '$$$',
  '$$$$': '$$$$',
};

const mealTypeLabels: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
};

export function RestaurantCard({ restaurant, isFavorite = false, onFavoriteToggle }: RestaurantCardProps) {
  const [favState, setFavState] = useState(isFavorite);
  
  const toggleFavorite = () => {
    setFavState(!favState);
    onFavoriteToggle?.(!favState);
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-border bg-card overflow-hidden">
      <div className="relative aspect-[4/3]">
        {restaurant.photoRef && process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_API_KEY ? (
          <Image
            src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${restaurant.photoRef}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_API_KEY}`}
            alt={restaurant.name}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.png';
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-muted to-accent">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        
        {/* Favorite button */}
        <Button
          onClick={toggleFavorite}
          size="icon"
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 shadow-sm"
          aria-label={favState ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`h-4 w-4 ${favState ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
        </Button>
        
        {restaurant.rating > 0 && (
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/90 dark:bg-slate-900/90 rounded-full shadow-sm backdrop-blur-sm">
              <Star className="h-3 w-3 fill-current text-amber-500" />
              <span className="text-xs font-semibold text-foreground">{restaurant.rating.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>
      
      <CardContent className="pt-4">
        <h3 className="text-lg font-semibold text-foreground leading-tight mb-2">{restaurant.name}</h3>
        
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge variant="outline" className="text-xs font-medium">{restaurant.cuisine}</Badge>
          <Badge variant="outline" className="text-xs font-medium">{mealTypeLabels[restaurant.mealType]}</Badge>
          <Badge variant="outline" className="text-xs font-medium">{priceRangeLabels[restaurant.priceRange] || restaurant.priceRange}</Badge>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {restaurant.description}
        </p>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {restaurant.address}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}