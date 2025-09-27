'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type PetMood = 'happy' | 'sad' | 'excited' | 'sleepy' | 'hungry' | 'satisfied';
type PetSize = 'small' | 'medium' | 'large';

interface PetState {
  mood: PetMood;
  size: PetSize;
  level: number;
  experience: number;
  lastFed: Date | null;
  streak: number;
  isAnimating: boolean;
}

interface PetContextType {
  pet: PetState;
  feedPet: (calories: number) => void;
  updateMood: (mood: PetMood) => void;
  updateSize: (size: PetSize) => void;
  addExperience: (exp: number) => void;
  updateStreak: () => void;
  resetPet: () => void;
}

const PetContext = createContext<PetContextType | undefined>(undefined);

const initialPetState: PetState = {
  mood: 'happy',
  size: 'medium',
  level: 1,
  experience: 0,
  lastFed: null,
  streak: 0,
  isAnimating: false,
};

export function PetProvider({ children }: { children: ReactNode }) {
  const [pet, setPet] = useState<PetState>(initialPetState);

  // Load pet state from localStorage on mount
  useEffect(() => {
    const savedPet = localStorage.getItem('habitpet-pet-state');
    if (savedPet) {
      try {
        const parsedPet = JSON.parse(savedPet);
        setPet({
          ...parsedPet,
          lastFed: parsedPet.lastFed ? new Date(parsedPet.lastFed) : null,
        });
      } catch (error) {
        console.error('Error loading pet state:', error);
      }
    }
  }, []);

  // Save pet state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('habitpet-pet-state', JSON.stringify(pet));
  }, [pet]);

  const feedPet = (calories: number) => {
    setPet(prev => {
      const newExp = prev.experience + Math.floor(calories / 10);
      const newLevel = Math.floor(newExp / 100) + 1;
      const newSize = newLevel >= 5 ? 'large' : newLevel >= 3 ? 'medium' : 'small';
      
      return {
        ...prev,
        mood: 'satisfied',
        size: newSize,
        level: newLevel,
        experience: newExp,
        lastFed: new Date(),
        isAnimating: true,
      };
    });

    // Stop animation after 2 seconds
    setTimeout(() => {
      setPet(prev => ({ ...prev, isAnimating: false }));
    }, 2000);
  };

  const updateMood = (mood: PetMood) => {
    setPet(prev => ({
      ...prev,
      mood,
      isAnimating: true,
    }));

    // Stop animation after 1 second
    setTimeout(() => {
      setPet(prev => ({ ...prev, isAnimating: false }));
    }, 1000);
  };

  const updateSize = (size: PetSize) => {
    setPet(prev => ({
      ...prev,
      size,
      isAnimating: true,
    }));

    setTimeout(() => {
      setPet(prev => ({ ...prev, isAnimating: false }));
    }, 1000);
  };

  const addExperience = (exp: number) => {
    setPet(prev => {
      const newExp = prev.experience + exp;
      const newLevel = Math.floor(newExp / 100) + 1;
      const newSize = newLevel >= 5 ? 'large' : newLevel >= 3 ? 'medium' : 'small';
      
      return {
        ...prev,
        level: newLevel,
        experience: newExp,
        size: newSize,
        mood: 'excited',
        isAnimating: true,
      };
    });

    setTimeout(() => {
      setPet(prev => ({ ...prev, isAnimating: false, mood: 'happy' }));
    }, 2000);
  };

  const updateStreak = () => {
    setPet(prev => ({
      ...prev,
      streak: prev.streak + 1,
      mood: 'excited',
      isAnimating: true,
    }));

    setTimeout(() => {
      setPet(prev => ({ ...prev, isAnimating: false, mood: 'happy' }));
    }, 2000);
  };

  const resetPet = () => {
    setPet(initialPetState);
  };

  // Auto-update mood based on time since last fed
  useEffect(() => {
    const checkHunger = () => {
      if (pet.lastFed) {
        const hoursSinceFed = (Date.now() - pet.lastFed.getTime()) / (1000 * 60 * 60);
        if (hoursSinceFed > 6) {
          setPet(prev => ({ ...prev, mood: 'hungry' }));
        } else if (hoursSinceFed > 4) {
          setPet(prev => ({ ...prev, mood: 'sleepy' }));
        }
      }
    };

    checkHunger();
    const interval = setInterval(checkHunger, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [pet.lastFed]);

  return (
    <PetContext.Provider value={{
      pet,
      feedPet,
      updateMood,
      updateSize,
      addExperience,
      updateStreak,
      resetPet,
    }}>
      {children}
    </PetContext.Provider>
  );
}

export function usePet() {
  const context = useContext(PetContext);
  if (context === undefined) {
    throw new Error('usePet must be used within a PetProvider');
  }
  return context;
}
