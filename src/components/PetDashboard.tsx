'use client';

import { usePet } from '@/contexts/PetContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Star, Trophy, Zap } from 'lucide-react';

export function PetDashboard() {
  const { pet, updateMood, resetPet } = usePet();

  const getMoodDescription = () => {
    switch (pet.mood) {
      case 'happy': return 'Your pet is happy and healthy! 🎉';
      case 'sad': return 'Your pet is feeling a bit down. Try logging some food! 😢';
      case 'excited': return 'Your pet is super excited! Keep up the great work! 🤩';
      case 'sleepy': return 'Your pet is getting sleepy. Time for a nap! 😴';
      case 'hungry': return 'Your pet is hungry! Feed them some nutritious food! 😋';
      case 'satisfied': return 'Your pet is satisfied and content! 😌';
      default: return 'Your pet is doing well!';
    }
  };

  const getSizeDescription = () => {
    switch (pet.size) {
      case 'small': return 'Your pet is still growing! Keep feeding them healthy food!';
      case 'medium': return 'Your pet is getting bigger and stronger!';
      case 'large': return 'Your pet is fully grown and majestic!';
      default: return 'Your pet is growing!';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Your Pet Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pet Status */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800">
            {getMoodDescription()}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {getSizeDescription()}
          </p>
        </div>

        {/* Pet Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Level</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{pet.level}</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Experience</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{pet.experience}</div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Streak</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">{pet.streak}</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Heart className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Mood</span>
            </div>
            <div className="text-lg font-bold text-purple-600 capitalize">{pet.mood}</div>
          </div>
        </div>


        {/* Last Fed Info */}
        {pet.lastFed && (
          <div className="text-center text-sm text-gray-600">
            Last fed: {pet.lastFed.toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
