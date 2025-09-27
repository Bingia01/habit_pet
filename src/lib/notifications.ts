// Push notification utilities
export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
}

// Check if notifications are supported
export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) {
    return { granted: false, denied: false, default: false };
  }

  const permission = await Notification.requestPermission();
  
  return {
    granted: permission === 'granted',
    denied: permission === 'denied',
    default: permission === 'default'
  };
};

// Check current permission status
export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) {
    return { granted: false, denied: false, default: false };
  }

  const permission = Notification.permission;
  
  return {
    granted: permission === 'granted',
    denied: permission === 'denied',
    default: permission === 'default'
  };
};

// Show notification
export const showNotification = (data: NotificationData): void => {
  if (!isNotificationSupported() || !getNotificationPermission().granted) {
    return;
  }

  const notification = new Notification(data.title, {
    body: data.body,
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    tag: data.tag,
    data: data.data,
  });

  // Auto-close after 5 seconds
  setTimeout(() => {
    notification.close();
  }, 5000);

  return notification;
};

// HabitPet specific notifications
export const showMealReminder = (mealType: string) => {
  showNotification({
    title: `🍽️ Time for ${mealType}!`,
    body: 'Don\'t forget to log your meal and keep your pet happy!',
    tag: 'meal-reminder',
    data: { type: 'meal-reminder', mealType }
  });
};

export const showStreakReminder = (days: number) => {
  showNotification({
    title: `🔥 ${days} Day Streak!`,
    body: 'Keep it up! Your pet is getting stronger every day!',
    tag: 'streak-reminder',
    data: { type: 'streak-reminder', days }
  });
};

export const showGoalReminder = (goal: string) => {
  showNotification({
    title: `🎯 Goal Reminder`,
    body: `Remember your goal: ${goal}`,
    tag: 'goal-reminder',
    data: { type: 'goal-reminder', goal }
  });
};

export const showPetCareReminder = () => {
  showNotification({
    title: `🐾 Pet Care Time!`,
    body: 'Your pet needs attention! Log some food to keep them healthy.',
    tag: 'pet-care',
    data: { type: 'pet-care' }
  });
};

// Schedule notifications
export const scheduleMealReminders = () => {
  // Clear existing notifications
  if ('serviceWorker' in navigator && 'getRegistrations' in navigator.serviceWorker) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.showNotification('Scheduling meal reminders...', {
          body: 'Setting up your daily meal reminders',
          tag: 'schedule-setup'
        });
      });
    });
  }
};
