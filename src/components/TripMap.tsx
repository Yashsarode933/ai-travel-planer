'use client';

import { useState, useEffect, useRef } from 'react';
import { EnrichedPlace, EnrichedRestaurant, AIItineraryDay } from '@/lib/types';
import { Loader2, MapPin, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TripMapProps {
  places: EnrichedPlace[];
  restaurants: EnrichedRestaurant[];
  itinerary: AIItineraryDay[];
  destination: string;
}

export function TripMap({ 
  places, 
  restaurants, 
  itinerary,
  destination 
}: TripMapProps) {
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Combine and deduplicate locations
  const allLocations = [...places, ...restaurants];
  const centerLat = allLocations.length > 0 
    ? allLocations.reduce((sum, loc) => sum + loc.lat, 0) / allLocations.length
    : 0;
  const centerLng = allLocations.length > 0 
    ? allLocations.reduce((sum, loc) => sum + loc.lng, 0) / allLocations.length
    : 0;

  useEffect(() => {
    // Load Google Maps script
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_API_KEY) {
      setLoading(false);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_API_KEY}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (mapRef.current) {
        const googleMaps = (window as any).google.maps;
        
        const mapInstance = new googleMaps.Map(mapRef.current, {
          center: { lat: centerLat, lng: centerLng },
          zoom: 12,
          mapTypeControl: true,
          streetViewControl: false,
        });

        setMap(mapInstance);

        // Add markers for places
        places.forEach(place => {
          if (place.lat && place.lng) {
            new googleMaps.Marker({
              position: { lat: place.lat, lng: place.lng },
              map: mapInstance,
              title: place.name,
              icon: {
                path: googleMaps.SymbolPath.CIRCLE,
                fillColor: '#3b82f6',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
                scale: 8,
              },
            });
          }
        });

        // Add markers for restaurants
        restaurants.forEach(restaurant => {
          if (restaurant.lat && restaurant.lng) {
            new googleMaps.Marker({
              position: { lat: restaurant.lat, lng: restaurant.lng },
              map: mapInstance,
              title: restaurant.name,
              icon: {
                path: googleMaps.SymbolPath.CIRCLE,
                fillColor: '#ef4444',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
                scale: 8,
              },
            });
          }
        });

        setLoading(false);
      }
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup script
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [places, restaurants, centerLat, centerLng, destination]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_API_KEY) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Interactive Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-8 text-center">
            <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Google Maps API key not configured. Set NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_API_KEY in your environment variables to view the interactive map.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border">
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Interactive Map
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {destination} • {places.length} places, {restaurants.length} restaurants
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div ref={mapRef} className="w-full h-96">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-muted-foreground">Loading map...</p>
              </div>
            </div>
          ) : (
            <div className="h-full relative">
              {/* Map legend */}
              <div className="absolute top-3 right-3 z-10 bg-white/95 dark:bg-slate-900/95 rounded-lg p-2 shadow-md backdrop-blur-sm border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-xs font-medium text-foreground">Places</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-xs font-medium text-foreground">Restaurants</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}