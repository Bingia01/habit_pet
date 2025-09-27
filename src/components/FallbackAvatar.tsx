'use client';

import { cn } from '@/lib/utils';

interface FallbackAvatarProps {
  mood: 'happy' | 'sad' | 'excited' | 'sleepy' | 'hungry' | 'satisfied' | 'content' | 'waving';
  size: 'small' | 'medium' | 'large';
  className?: string;
}

export function FallbackAvatar({ mood, size, className }: FallbackAvatarProps) {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  const moodEmojis = {
    happy: '😊',
    sad: '😢',
    excited: '🤩',
    sleepy: '😴',
    hungry: '😋',
    satisfied: '😌',
    content: '😌',
    waving: '👋'
  };

  return (
    <div className={cn(
      'flex items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-green-200',
      sizeClasses[size],
      className
    )}>
      <div className="text-4xl animate-bounce">
        {moodEmojis[mood]}
      </div>
    </div>
  );
}
