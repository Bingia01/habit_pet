'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Bell, BellOff, Clock, Target, Heart } from 'lucide-react';
import { 
  getNotificationPermission, 
  requestNotificationPermission, 
  isNotificationSupported,
  showNotification 
} from '@/lib/notifications';

interface NotificationSettingsProps {
  onPermissionChange?: (granted: boolean) => void;
}

export function NotificationSettings({ onPermissionChange }: NotificationSettingsProps) {
  const [permission, setPermission] = useState(getNotificationPermission());
  const [isSupported, setIsSupported] = useState(false);
  const [settings, setSettings] = useState({
    mealReminders: true,
    streakReminders: true,
    goalReminders: true,
    petCareReminders: true,
  });

  useEffect(() => {
    setIsSupported(isNotificationSupported());
    setPermission(getNotificationPermission());
  }, []);

  const handleRequestPermission = async () => {
    const newPermission = await requestNotificationPermission();
    setPermission(newPermission);
    onPermissionChange?.(newPermission.granted);
  };

  const handleTestNotification = () => {
    showNotification({
      title: '🔔 Test Notification',
      body: 'This is a test notification from HabitPet!',
      tag: 'test-notification'
    });
  };

  const handleSettingChange = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="w-5 h-5" />
            Notifications Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Your browser doesn't support notifications. Please use a modern browser like Chrome, Firefox, or Safari.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Permission Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {permission.granted ? (
              <Bell className="w-5 h-5 text-green-600" />
            ) : (
              <BellOff className="w-5 h-5 text-red-600" />
            )}
            Notification Permission
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {permission.granted ? (
            <div className="text-green-600">
              ✅ Notifications are enabled! You'll receive reminders and updates.
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-600">
                Enable notifications to receive meal reminders, streak updates, and pet care alerts.
              </p>
              <Button onClick={handleRequestPermission} className="w-full">
                Enable Notifications
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      {permission.granted && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">Meal Reminders</p>
                  <p className="text-sm text-gray-600">Get reminded to log your meals</p>
                </div>
              </div>
              <Switch
                checked={settings.mealReminders}
                onCheckedChange={() => handleSettingChange('mealReminders')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium">Streak Reminders</p>
                  <p className="text-sm text-gray-600">Celebrate your daily streaks</p>
                </div>
              </div>
              <Switch
                checked={settings.streakReminders}
                onCheckedChange={() => handleSettingChange('streakReminders')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium">Goal Reminders</p>
                  <p className="text-sm text-gray-600">Stay focused on your goals</p>
                </div>
              </div>
              <Switch
                checked={settings.goalReminders}
                onCheckedChange={() => handleSettingChange('goalReminders')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium">Pet Care Reminders</p>
                  <p className="text-sm text-gray-600">Keep your pet healthy and happy</p>
                </div>
              </div>
              <Switch
                checked={settings.petCareReminders}
                onCheckedChange={() => handleSettingChange('petCareReminders')}
              />
            </div>

            <div className="pt-4 border-t">
              <Button 
                onClick={handleTestNotification}
                variant="outline"
                className="w-full"
              >
                Test Notification
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
