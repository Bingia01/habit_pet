'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { calculateAvatarState, AvatarStats } from '@/lib/avatar-logic';
import { AvatarPet } from '@/components/AvatarPet';

interface AvatarDisplayProps {
  stats: AvatarStats;
  showFeedback?: boolean;
  feedbackMessage?: string;
}

export function AvatarDisplay({ stats, showFeedback = false, feedbackMessage }: AvatarDisplayProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const avatar = calculateAvatarState(stats);

  useEffect(() => {
    if (showFeedback) {
      setShowAnimation(true);
      const timer = setTimeout(() => setShowAnimation(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showFeedback]);

  const getAnimationClass = () => {
    if (!showAnimation && !avatar.animation) return '';

    switch (avatar.animation) {
      case 'bounce':
        return 'animate-bounce';
      case 'wiggle':
        return 'animate-pulse';
      case 'fade':
        return 'animate-pulse opacity-50';
      default:
        return '';
    }
  };

  return (
    <Card className="text-center relative overflow-hidden">
      <CardContent className="pt-6 pb-8">
        {/* Level Badge */}
        <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
          LV {stats.level}
        </div>

        {/* Streak Badge */}
        {stats.currentStreak > 0 && (
          <div className="absolute top-4 left-4 bg-green-400 text-green-900 text-xs font-bold px-2 py-1 rounded-full">
            🔥 {stats.currentStreak}
          </div>
        )}

        {/* Avatar */}
        <div className={`mb-4 transition-all duration-500 ${getAnimationClass()}`}>
          <AvatarPet
            mood={avatar.state === 'neutral' ? 'content' : avatar.state === 'excited' ? 'excited' : avatar.state as any}
            size="large"
            isAnimating={showAnimation}
            className="w-32 h-32 mx-auto"
            onInteraction={(type) => {
              console.log(`Pet interaction: ${type}`);
            }}
          />
        </div>

        {/* Main Message */}
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {showFeedback && feedbackMessage ? feedbackMessage : avatar.message}
        </h2>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-1 mb-4">
          {[...Array(5)].map((_, index) => {
            const threshold = (index + 1) * 20;
            const isActive = stats.dailyProgress >= threshold;
            return (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  isActive ? 'bg-green-400 scale-110' : 'bg-gray-200'
                }`}
              />
            );
          })}
        </div>

        {/* Feedback Toast */}
        {showFeedback && feedbackMessage && (
          <div className="absolute inset-x-4 top-1/2 transform -translate-y-1/2">
            <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
              <p className="font-semibold">{feedbackMessage}</p>
            </div>
          </div>
        )}

        {/* Health Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(stats.dailyProgress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {Math.round(stats.dailyProgress)}% daily goal
          </p>
        </div>
      </CardContent>
    </Card>
  );
}