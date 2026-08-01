'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Loader2, MapPin } from 'lucide-react';

interface AutocompletePrediction {
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  place_id: string;
}

interface DestinationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onGeocode: (lat: number, lng: number) => void;
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_API_KEY;

export function DestinationAutocomplete({ value, onChange, onGeocode }: DestinationAutocompleteProps) {
  const [predictions, setPredictions] = useState<AutocompletePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteServiceRef = useRef<any>(null);
  const [placesService, setPlacesService] = useState<any>(null);

  // Load Google Maps script
  useEffect(() => {
    if (typeof window === 'undefined' || !GOOGLE_MAPS_API_KEY) return;

    // Check if script already loaded
    if ((window as any).google && (window as any).google.maps) {
      initAutocomplete();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initAutocomplete;
    document.head.appendChild(script);

    function initAutocomplete() {
      if ((window as any).google && (window as any).google.maps) {
        const service = new (window as any).google.maps.places.AutocompleteService();
        autocompleteServiceRef.current = service;
        const places = new (window as any).google.maps.places.PlacesService(document.createElement('div'));
        setPlacesService(places);
      }
    }

    return () => {
      // Cleanup script if needed
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    fetchPredictions(newValue);
  };

  const fetchPredictions = async (input: string) => {
    if (!autocompleteServiceRef.current || !input.trim()) {
      setPredictions([]);
      return;
    }

    setLoading(true);
    try {
      const request = {
        input,
        fields: ['place_id', 'geometry', 'formatted_address'],
        types: ['(cities)', '(regions)'] as const,
      };

      const results = await autocompleteServiceRef.current.getPlacePredictions(request);
      setPredictions(results || []);
    } catch (error) {
      console.error('Autocomplete error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (prediction: AutocompletePrediction) => {
    onChange(prediction.description);
    setShowPredictions(false);
    setPredictions([]);

    if (placesService && prediction.place_id) {
      try {
        const place = await placesService.getDetails({
          placeId: prediction.place_id,
          fields: ['geometry'],
        });
        
        if (place.geometry?.location) {
          onGeocode(place.geometry.location.lat(), place.geometry.location.lng());
        }
      } catch (error) {
        console.error('Geocode error:', error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowPredictions(false);
      setPredictions([]);
    }
    if (e.key === 'ArrowDown' && predictions.length > 0) {
      e.preventDefault();
      setFocusedIndex(prev => Math.min(prev + 1, predictions.length - 1));
    }
    if (e.key === 'ArrowUp' && predictions.length > 0) {
      e.preventDefault();
      setFocusedIndex(prev => Math.max(prev - 1, 0));
    }
    if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      handleSelect(predictions[focusedIndex]);
    }
  };

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="space-y-2">
        <label htmlFor="destination" className="text-sm font-medium text-foreground">
          Destination
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="destination"
            ref={inputRef}
            placeholder="Enter destination..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor="destination" className="text-sm font-medium text-foreground">
        Destination
      </label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          id="destination"
          ref={inputRef}
          placeholder="Start typing your destination..."
          value={value}
          onChange={handleInputChange}
          onFocus={() => setShowPredictions(predictions.length > 0)}
          onBlur={() => setTimeout(() => setShowPredictions(false), 200)}
          onKeyDown={handleKeyDown}
          className="pl-10"
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
        )}
        
        {showPredictions && predictions.length > 0 && (
          <ul className="absolute z-50 w-full bg-white dark:bg-slate-900 border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {predictions.map((prediction, index) => (
              <li
                key={prediction.place_id}
                className={`px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer border-b last:border-b-0 ${
                  index === focusedIndex ? 'bg-gray-100 dark:bg-gray-800' : ''
                }`}
                onMouseEnter={() => setFocusedIndex(index)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(prediction);
                }}
              >
                <div className="font-medium text-foreground">{prediction.structured_formatting.main_text}</div>
                <div className="text-sm text-muted-foreground">
                  {prediction.structured_formatting.secondary_text}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}