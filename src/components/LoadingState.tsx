'use client';

import { Loader2, MapPin, Sparkles, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LoadingStateProps {
  step?: 'geocoding' | 'generating' | 'enriching' | 'complete';
  message?: string;
}

export function LoadingState({ 
  step = 'geocoding', 
  message 
}: LoadingStateProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const steps = {
    geocoding: {
      title: 'Finding your destination',
      description: 'Using Google Maps to locate your destination...',
      icon: Globe,
    },
    generating: {
      title: 'Creating your itinerary',
      description: 'Planning the perfect trip with AI...',
      icon: Sparkles,
    },
    enriching: {
      title: 'Enriching place details',
      description: 'Adding photos, ratings, and real-time info...',
      icon: MapPin,
    },
    complete: {
      title: 'All set!',
      description: 'Your trip is ready to explore',
      icon: Loader2,
    },
  };

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-blue-100 dark:bg-blue-900/20 animate-pulse" />
        <Icon className={`relative h-16 w-16 animate-bounce ${step === 'complete' ? 'text-green-500' : 'text-primary'}`} />
        {step !== 'complete' && (
          <div className="absolute -top-3 -right-3">
            <div className="h-6 w-6 rounded-full bg-white dark:bg-slate-900 shadow-md flex items-center justify-center">
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-2xl font-semibold text-foreground">
          {message || currentStep.title}
        </h3>
        {message ? (
          <p className="text-muted-foreground max-w-xs">
            {currentStep.description}
          </p>
        ) : (
          <p className="text-muted-foreground max-w-xs">
            {message ? undefined : currentStep.description}
          </p>
        )}
      </div>

      {step !== 'complete' && (
        <div className="w-80 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}

      {step === 'complete' && (
        <p className="text-sm text-muted-foreground">
          Found {Math.floor(progress)} unique places to explore!
        </p>
      )}
    </div>
  );
}