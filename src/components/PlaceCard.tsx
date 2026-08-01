'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnrichedPlace } from '@/lib/types';
import { Star, MapPin, Clock, DollarSign } from 'lucide-react';
import Image from 'next/image';

interface PlaceCardProps {
  place: EnrichedPlace;
}

export function PlaceCard({ place }: PlaceCardProps) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-border bg-card overflow-hidden">
      <div className="relative aspect-[4/3]">
        {place.photoRef && process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_API_KEY ? (
          <Image
            src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${place.photoRef}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_API_KEY}`}
            alt={place.name}
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
        
        {place.rating > 0 && (
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/90 dark:bg-slate-900/90 rounded-full shadow-sm backdrop-blur-sm">
              <Star className="h-3 w-3 fill-current text-amber-500" />
              <span className="text-xs font-semibold text-foreground">{place.rating.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>
      
      <CardContent className="pt-4">
        <h3 className="text-lg font-semibold text-foreground leading-tight mb-2">{place.name}</h3>
        
        <Badge variant="outline" className="mb-3 text-xs font-medium">
          {place.category}
        </Badge>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {place.description}
        </p>
        
        <div className="flex flex-wrap gap-1.5 mb-4">
          {place.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{place.estimatedDurationMinutes} min</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium">${place.estimatedCost}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}