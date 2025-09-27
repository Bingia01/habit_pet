'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationSettings } from '@/components/NotificationSettings';
import { 
  showMealReminder, 
  showStreakReminder, 
  showGoalReminder, 
  showPetCareReminder,
  showNotification 
} from '@/lib/notifications';

export default function TestNotificationsPage() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const testMealReminder = () => {
    addLog('Testing meal reminder notification...');
    showMealReminder('Breakfast');
  };

  const testStreakReminder = () => {
    addLog('Testing streak reminder notification...');
    showStreakReminder(7);
  };

  const testGoalReminder = () => {
    addLog('Testing goal reminder notification...');
    showGoalReminder('Eat 5 servings of vegetables today');
  };

  const testPetCareReminder = () => {
    addLog('Testing pet care reminder notification...');
    showPetCareReminder();
  };

  const testCustomNotification = () => {
    addLog('Testing custom notification...');
    showNotification({
      title: '🎉 Custom Test',
      body: 'This is a custom notification test!',
      tag: 'custom-test'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">🔔 Notification Test Center</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Test all notification types and settings for HabitPet.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={testMealReminder} variant="outline">
                🍽️ Meal Reminder
              </Button>
              <Button onClick={testStreakReminder} variant="outline">
                🔥 Streak Reminder
              </Button>
              <Button onClick={testGoalReminder} variant="outline">
                🎯 Goal Reminder
              </Button>
              <Button onClick={testPetCareReminder} variant="outline">
                🐾 Pet Care
              </Button>
              <Button onClick={testCustomNotification} variant="outline" className="col-span-2">
                🎉 Custom Notification
              </Button>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Test Logs</h3>
              <div className="h-64 bg-gray-900 text-green-400 p-3 rounded-lg overflow-y-auto font-mono text-sm">
                {logs.length === 0 ? (
                  <p className="text-gray-500">No logs yet...</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="mb-1">{log}</div>
                  ))
                )}
              </div>
              <Button 
                onClick={() => setLogs([])}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Clear Logs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <NotificationSettings />
      </div>
    </div>
  );
}
