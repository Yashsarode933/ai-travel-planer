'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BudgetTier } from '@/lib/types';
import { PiggyBank, Wallet, Diamond } from 'lucide-react';

interface BudgetSelectorProps {
  value: BudgetTier;
  onChange: (value: BudgetTier) => void;
}

const budgetOptions = [
  {
    value: 'budget' as BudgetTier,
    title: 'Budget',
    description: 'Up to $50 per person per day',
    icon: PiggyBank,
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  {
    value: 'mid-range' as BudgetTier,
    title: 'Mid-range',
    description: '$100-200 per person per day',
    icon: Wallet,
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    value: 'luxury' as BudgetTier,
    title: 'Luxury',
    description: '$300+ per person per day',
    icon: Diamond,
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
];

export function BudgetSelector({ value, onChange }: BudgetSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Select Your Budget</h3>
        <p className="text-sm text-muted-foreground">
          Choose a budget tier to help us customize your trip recommendations
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        {budgetOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;
          
          return (
            <button
              key={option.value}
              type="button"
              className={`rounded-xl p-4 text-left transition-all duration-200 ${
                isSelected
                  ? `border-2 ${option.color.split(' ')[0].replace('from', 'border')} cursor-pointer`
                  : 'border border-gray-200 dark:border-gray-700 hover:shadow-md'
              }`}
              onClick={() => onChange(option.value)}
            >
              <div className="flex items-start gap-3">
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${option.bgColor} ${option.iconColor}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{option.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {option.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}