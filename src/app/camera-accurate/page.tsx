'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FinalCameraCapture } from '@/components/FinalCameraCapture';

interface FoodData {
  foodType: string;
  calories: number;
  weight: number;
  confidence: number;
  emoji?: string;
}

export default function CameraAccuratePage() {
  const [showCamera, setShowCamera] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [submittedFood, setSubmittedFood] = useState<FoodData | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const handleFoodSubmission = async (foodData: FoodData) => {
    addLog(`Food submitted: ${foodData.emoji} ${foodData.foodType} (${foodData.calories} kcal, ${foodData.weight}g)`);
    setSubmittedFood(foodData);
    setShowCamera(false); // Close camera after submission
    // User should now be redirected to main page
    addLog('✅ Food logged successfully! Redirecting to main page...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">🎯 Accurate Camera Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Test the improved camera with better AI accuracy and manual food selection.
              </p>
            </div>
            
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">🎯 Improved Accuracy Features:</strong>
              <ul className="mt-2 text-sm space-y-1">
                <li>• <strong>Smarter AI:</strong> Analyzes image size and characteristics</li>
                <li>• <strong>Food Categories:</strong> Fruits, Proteins, Vegetables, Grains, Dairy</li>
                <li>• <strong>Manual Selection:</strong> If AI is wrong, choose from 30+ foods</li>
                <li>• <strong>Search & Filter:</strong> Find foods by name or category</li>
                <li>• <strong>Realistic Data:</strong> Accurate calories and weights</li>
              </ul>
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={() => {
                  addLog('Opening improved camera...');
                  setShowCamera(true);
                  setSubmittedFood(null);
                }}
                className="w-48"
              >
                Test Improved Camera
              </Button>
            </div>
            
            {submittedFood && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4" role="alert">
                <strong className="font-bold">Food Logged Successfully!</strong>
                <span className="block sm:inline"> {submittedFood.emoji} {submittedFood.foodType} - {submittedFood.calories} kcal, {submittedFood.weight}g</span>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-2">Debug Logs</h3>
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
      </div>

      {/* Camera Component */}
      {showCamera && (
        <FinalCameraCapture
          onCapture={handleFoodSubmission}
          onClose={() => {
            addLog('Camera closed');
            setShowCamera(false);
          }}
        />
      )}
    </div>
  );
}
