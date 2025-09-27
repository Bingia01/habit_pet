'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FoodSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (food: { name: string; calories: number; weight: number; emoji: string }) => void;
  currentGuess: { name: string; calories: number; weight: number; emoji: string };
}

const FOOD_OPTIONS = [
  // Fruits
  { name: 'Apple', calories: 95, weight: 150, emoji: '🍎', category: 'Fruits' },
  { name: 'Banana', calories: 105, weight: 120, emoji: '🍌', category: 'Fruits' },
  { name: 'Orange', calories: 62, weight: 130, emoji: '🍊', category: 'Fruits' },
  { name: 'Strawberry', calories: 4, weight: 150, emoji: '🍓', category: 'Fruits' },
  { name: 'Avocado', calories: 234, weight: 200, emoji: '🥑', category: 'Fruits' },
  { name: 'Grape', calories: 62, weight: 100, emoji: '🍇', category: 'Fruits' },
  
  // Proteins
  { name: 'Chicken Breast', calories: 165, weight: 100, emoji: '🍗', category: 'Proteins' },
  { name: 'Salmon', calories: 206, weight: 100, emoji: '🐟', category: 'Proteins' },
  { name: 'Egg', calories: 70, weight: 50, emoji: '🥚', category: 'Proteins' },
  { name: 'Beef', calories: 250, weight: 100, emoji: '🥩', category: 'Proteins' },
  { name: 'Tofu', calories: 94, weight: 100, emoji: '🧈', category: 'Proteins' },
  
  // Vegetables
  { name: 'Broccoli', calories: 55, weight: 100, emoji: '🥦', category: 'Vegetables' },
  { name: 'Carrot', calories: 25, weight: 80, emoji: '🥕', category: 'Vegetables' },
  { name: 'Lettuce', calories: 5, weight: 50, emoji: '🥬', category: 'Vegetables' },
  { name: 'Tomato', calories: 18, weight: 120, emoji: '🍅', category: 'Vegetables' },
  { name: 'Cucumber', calories: 16, weight: 100, emoji: '🥒', category: 'Vegetables' },
  
  // Grains
  { name: 'Rice', calories: 130, weight: 100, emoji: '🍚', category: 'Grains' },
  { name: 'Bread', calories: 80, weight: 30, emoji: '🍞', category: 'Grains' },
  { name: 'Pasta', calories: 131, weight: 100, emoji: '🍝', category: 'Grains' },
  { name: 'Potato', calories: 77, weight: 150, emoji: '🥔', category: 'Grains' },
  { name: 'Quinoa', calories: 120, weight: 100, emoji: '🌾', category: 'Grains' },
  
  // Dairy
  { name: 'Cheese', calories: 113, weight: 30, emoji: '🧀', category: 'Dairy' },
  { name: 'Milk', calories: 42, weight: 250, emoji: '🥛', category: 'Dairy' },
  { name: 'Yogurt', calories: 59, weight: 150, emoji: '🥛', category: 'Dairy' },
  
  // Snacks
  { name: 'Nuts', calories: 160, weight: 30, emoji: '🥜', category: 'Snacks' },
  { name: 'Crackers', calories: 50, weight: 20, emoji: '🍪', category: 'Snacks' }
];

export function FoodSelectionModal({ isOpen, onClose, onSelect, currentGuess }: FoodSelectionModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const categories = ['All', ...Array.from(new Set(FOOD_OPTIONS.map(food => food.category)))];
  
  const filteredFoods = FOOD_OPTIONS.filter(food => {
    const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader>
          <CardTitle className="text-center">🍽️ Select the Correct Food</CardTitle>
          <p className="text-center text-sm text-gray-600">
            AI guessed: <strong>{currentGuess.emoji} {currentGuess.name}</strong> - Is this correct?
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Search foods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Food Grid */}
          <div className="max-h-64 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              {filteredFoods.map((food) => (
                <Button
                  key={food.name}
                  variant="outline"
                  onClick={() => onSelect(food)}
                  className="flex items-center justify-start p-3 h-auto"
                >
                  <span className="mr-2">{food.emoji}</span>
                  <div className="text-left">
                    <div className="font-medium">{food.name}</div>
                    <div className="text-xs text-gray-500">
                      {food.calories} cal, {food.weight}g
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={() => onSelect(currentGuess)}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              ✅ Yes, AI is correct
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
