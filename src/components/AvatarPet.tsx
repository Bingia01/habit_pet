'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AvatarPetProps {
  mood: 'happy' | 'sad' | 'excited' | 'sleepy' | 'hungry' | 'satisfied' | 'content' | 'waving';
  size: 'small' | 'medium' | 'large';
  isAnimating?: boolean;
  className?: string;
  onInteraction?: (type: string) => void;
}

export function AvatarPet({ 
  mood, 
  size, 
  isAnimating, 
  className,
  onInteraction 
}: AvatarPetProps) {
  const [interactionType, setInteractionType] = useState<string>('');
  const [currentMood, setCurrentMood] = useState(mood);
  const [isBouncing, setIsBouncing] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  // Avatar image library - using your existing avatars
  const avatarImages = {
    'happy': '/avatars/happy.png',           // Top-left: Neutral/Happy
    'excited': '/avatars/excited.png',       // Top-right: Happy/Excited with blush
    'content': '/avatars/content.png',       // Middle-left: Content/Sleepy
    'waving': '/avatars/waving.png',         // Middle-right: Waving/Excited
    'sleepy': '/avatars/sleepy.png',         // Bottom-left: Sleepy/Drowsy
    'sad': '/avatars/sad.png',              // Bottom-right: Sad/Upset
    'hungry': '/avatars/hungry.png',         // We'll use excited for hungry
    'satisfied': '/avatars/satisfied.png'    // We'll use content for satisfied
  };

  // Size classes
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24', 
    large: 'w-32 h-32'
  };

  // Update mood when prop changes
  useEffect(() => {
    setCurrentMood(mood);
  }, [mood]);

  // Handle user interactions
  const handleClick = () => {
    setInteractionType('bounce');
    setIsBouncing(true);
    onInteraction?.('click');
    
    setTimeout(() => {
      setInteractionType('');
      setIsBouncing(false);
    }, 1000);
  };

  const handleHover = () => {
    setInteractionType('pulse');
    setIsPulsing(true);
    onInteraction?.('hover');
    
    setTimeout(() => {
      setInteractionType('');
      setIsPulsing(false);
    }, 500);
  };

  // Auto-animation for different moods
  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        if (currentMood === 'happy' || currentMood === 'excited') {
          setIsBouncing(true);
          setTimeout(() => setIsBouncing(false), 1000);
        } else if (currentMood === 'sleepy') {
          setIsPulsing(true);
          setTimeout(() => setIsPulsing(false), 2000);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isAnimating, currentMood]);

  return (
    <div 
      className={cn(
        'relative cursor-pointer select-none',
        sizeClasses[size],
        className
      )}
      onClick={handleClick}
      onMouseEnter={handleHover}
    >
      {/* Main Avatar Image */}
      <motion.div
        className="relative w-full h-full"
        animate={{
          scale: isBouncing ? [1, 1.1, 1] : 1,
          y: isBouncing ? [0, -5, 0] : 0,
        }}
        transition={{
          duration: 0.6,
          ease: "easeInOut"
        }}
      >
        <img
          ref={imageRef}
          src={avatarImages[currentMood]}
          alt={`Pet in ${currentMood} mood`}
          className={cn(
            'w-full h-full object-contain transition-all duration-300',
            isPulsing && 'animate-pulse',
            interactionType === 'bounce' && 'animate-bounce'
          )}
          style={{ 
            transform: 'scaleX(-1)' // Mirror the image
          }}
          onError={() => {
            console.log(`Failed to load image for mood: ${currentMood}`);
            // Fallback to happy mood if image fails to load
            setCurrentMood('happy');
          }}
        />
      </motion.div>

      {/* Interaction Effects */}
      <AnimatePresence>
        {interactionType === 'bounce' && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 animate-ping">
              ❤️
            </div>
            <div className="absolute top-2 right-0 animate-ping delay-300">
              💚
            </div>
            <div className="absolute top-4 left-0 animate-ping delay-700">
              💛
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mood Indicators */}
      {currentMood === 'hungry' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
        >
          <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
            Feed me! 🍎
          </div>
        </motion.div>
      )}

      {currentMood === 'sleepy' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-2 left-1/2 transform -translate-x-1/2"
        >
          <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            😴 Zzz...
          </div>
        </motion.div>
      )}

      {currentMood === 'sad' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
        >
          <div className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
            😢 Need attention
          </div>
        </motion.div>
      )}

      {/* Floating particles for happy mood */}
      {currentMood === 'happy' && (
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0
            }}
            className="absolute top-0 left-1/4"
          >
            ✨
          </motion.div>
          <motion.div
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.5
            }}
            className="absolute top-0 right-1/4"
          >
            ⭐
          </motion.div>
          <motion.div
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1
            }}
            className="absolute top-0 left-1/2"
          >
            🌟
          </motion.div>
        </div>
      )}
    </div>
  );
}
