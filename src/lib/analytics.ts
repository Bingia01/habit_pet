// Google Analytics integration
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID!, {
      page_path: url,
    });
  }
};

// Track custom events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// HabitPet specific tracking events
export const trackFoodLogged = (foodType: string, calories: number) => {
  event({
    action: 'food_logged',
    category: 'nutrition',
    label: foodType,
    value: calories,
  });
};

export const trackCameraUsed = () => {
  event({
    action: 'camera_opened',
    category: 'feature_usage',
    label: 'food_camera',
  });
};

export const trackFoodAnalysis = (accuracy: 'correct' | 'incorrect') => {
  event({
    action: 'food_analysis',
    category: 'ai_accuracy',
    label: accuracy,
  });
};

export const trackUserProgress = (milestone: string) => {
  event({
    action: 'progress_milestone',
    category: 'user_engagement',
    label: milestone,
  });
};

export const trackError = (errorType: string, errorMessage: string) => {
  event({
    action: 'error_occurred',
    category: 'errors',
    label: `${errorType}: ${errorMessage}`,
  });
};
