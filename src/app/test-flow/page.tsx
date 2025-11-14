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

export default function TestFlowPage() {
  const [showCamera, setShowCamera] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [submittedFood, setSubmittedFood] = useState<FoodData | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const handleFoodSubmission = async (foodData: FoodData) => {
    addLog(`✅ Food submitted: ${foodData.emoji} ${foodData.foodType} (${foodData.calories} kcal, ${foodData.weight}g)`);
    setSubmittedFood(foodData);
    setShowCamera(false); // Close camera after submission
    addLog('🎉 Food logged successfully! User should now be redirected to main page.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">🔄 Complete Flow Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Test the complete camera → food selection → submission → redirect flow.
              </p>
            </div>
            
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">✅ Expected Flow:</strong>
              <ol className="mt-2 text-sm space-y-1 list-decimal list-inside">
                <li>Click &quot;Test Camera&quot; → Camera opens</li>
                <li>Take photo → AI analyzes food</li>
                <li>Review result → Click &quot;Yes, Submit&quot; or &quot;Wrong? Select Different&quot;</li>
                <li>If &quot;Yes, Submit&quot; → Food is logged and camera closes</li>
                <li>User should be redirected to main page (simulated by success message)</li>
              </ol>
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={() => {
                  addLog('Opening camera for complete flow test...');
                  setShowCamera(true);
                  setSubmittedFood(null);
                }}
                className="w-48"
              >
                Test Complete Flow
              </Button>
            </div>
            
            {submittedFood && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4" role="alert">
                <strong className="font-bold">🎉 Flow Complete!</strong>
                <span className="block sm:inline"> {submittedFood.emoji} {submittedFood.foodType} - {submittedFood.calories} kcal, {submittedFood.weight}g</span>
                <p className="text-sm mt-2">✅ User should now be redirected to main page</p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-2">Flow Test Logs</h3>
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
