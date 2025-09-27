import { useState, useEffect, useCallback } from 'react';

export function useLivingPet(initialMood: string) {
  const [currentMood, setCurrentMood] = useState(initialMood);
  const [isAlive, setIsAlive] = useState(true);
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const [interactionCount, setInteractionCount] = useState(0);
  const [lastInteraction, setLastInteraction] = useState<number>(0);

  // Auto-mood changes to keep pet "alive"
  useEffect(() => {
    if (!isAlive) return;

    const moodCycle = [
      'idle',
      'curious',
      'happy',
      'playful',
      'content',
      'idle'
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      // Only change mood if no recent interaction
      const timeSinceLastInteraction = Date.now() - lastInteraction;
      if (timeSinceLastInteraction > 10000) { // 10 seconds
        setCurrentAnimation(moodCycle[currentIndex]);
        currentIndex = (currentIndex + 1) % moodCycle.length;
      }
    }, 8000); // Change every 8 seconds

    return () => clearInterval(interval);
  }, [isAlive, lastInteraction]);

  // Handle user interactions
  const handleInteraction = useCallback((type: string) => {
    setInteractionCount(prev => prev + 1);
    setLastInteraction(Date.now());
    
    switch (type) {
      case 'feed':
        setCurrentMood('satisfied');
        setCurrentAnimation('happy');
        // Auto-return to content after 5 seconds
        setTimeout(() => {
          setCurrentMood('content');
          setCurrentAnimation('idle');
        }, 5000);
        break;
      case 'pet':
        setCurrentMood('happy');
        setCurrentAnimation('excited');
        // Auto-return to content after 3 seconds
        setTimeout(() => {
          setCurrentMood('content');
          setCurrentAnimation('idle');
        }, 3000);
        break;
      case 'ignore':
        setCurrentMood('sad');
        setCurrentAnimation('sad');
        // Auto-return to content after 5 seconds
        setTimeout(() => {
          setCurrentMood('content');
          setCurrentAnimation('idle');
        }, 5000);
        break;
      case 'click':
        setCurrentMood('excited');
        setCurrentAnimation('waving');
        // Auto-return to happy after 2 seconds
        setTimeout(() => {
          setCurrentMood('happy');
          setCurrentAnimation('idle');
        }, 2000);
        break;
      case 'hover':
        setCurrentMood('happy');
        setCurrentAnimation('happy');
        // Auto-return to content after 1 second
        setTimeout(() => {
          setCurrentMood('content');
          setCurrentAnimation('idle');
        }, 1000);
        break;
    }
  }, []);

  // Handle hunger over time
  useEffect(() => {
    const hungerInterval = setInterval(() => {
      const timeSinceLastFeed = Date.now() - lastInteraction;
      const hungerThreshold = 1000 * 60 * 30; // 30 minutes

      if (timeSinceLastFeed > hungerThreshold && currentMood !== 'hungry') {
        setCurrentMood('hungry');
        setCurrentAnimation('hungry');
      }
    }, 1000 * 60 * 5); // Check every 5 minutes

    return () => clearInterval(hungerInterval);
  }, [lastInteraction, currentMood]);

  // Handle sleepiness
  useEffect(() => {
    const sleepInterval = setInterval(() => {
      const hour = new Date().getHours();
      if (hour >= 22 || hour <= 6) { // 10 PM to 6 AM
        if (currentMood !== 'sleepy') {
          setCurrentMood('sleepy');
          setCurrentAnimation('sleepy');
        }
      } else if (currentMood === 'sleepy') {
        setCurrentMood('content');
        setCurrentAnimation('idle');
      }
    }, 1000 * 60 * 10); // Check every 10 minutes

    return () => clearInterval(sleepInterval);
  }, [currentMood]);

  return {
    currentMood,
    currentAnimation,
    isAlive,
    interactionCount,
    handleInteraction,
    setIsAlive
  };
}
