'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnrichedPlace, EnrichedRestaurant, BudgetTier } from '@/lib/types';
import { Calculator, MapPin, Utensils } from 'lucide-react';

interface ExpenseSummaryProps {
  places: EnrichedPlace[];
  restaurants: EnrichedRestaurant[];
  budgetTier: BudgetTier;
  currency: string;
}

const budgetTierLabels: Record<BudgetTier, string> = {
  'budget': 'Budget',
  'mid-range': 'Mid-range',
  'luxury': 'Luxury',
};

export function ExpenseSummary({ 
  places, 
  restaurants, 
  budgetTier, 
  currency 
}: ExpenseSummaryProps) {
  const totalPlacesCost = places.reduce((sum, p) => sum + (p.estimatedCost || 0), 0);
  const totalRestaurantsCost = restaurants.reduce((sum, r) => {
    // Estimate average meal cost based on price range
    const priceMultipliers: Record<string, number> = {
      '$': 10,
      '$$': 25,
      '$$$': 50,
      '$$$$': 100,
    };
    const multiplier = priceMultipliers[r.priceRange] || 25;
    // Assume 1.5 meals per day per restaurant appearance
    return sum + multiplier;
  }, 0);

  const totalEstimated = totalPlacesCost + totalRestaurantsCost;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-b border-border">
        <CardTitle className="text-lg">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>Cost Estimate</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 px-4 bg-muted/30 dark:bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Places ({places.length})</span>
            </div>
            <span className="font-semibold">{currency} {totalPlacesCost.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center py-3 px-4 bg-muted/30 dark:bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Utensils className="h-4 w-4 text-amber-500" />
              <span className="text-sm">Restaurants ({restaurants.length})</span>
            </div>
            <span className="font-semibold">{currency} {totalRestaurantsCost.toLocaleString()}</span>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Total (estimated)</span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {currency} {totalEstimated.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Estimated per person • {budgetTierLabels[budgetTier]} budget tier
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}