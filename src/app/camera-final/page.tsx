'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FinalCameraCapture } from '@/components/FinalCameraCapture';

export default function CameraFinalPage() {
  const [showCamera, setShowCamera] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const handleFoodSubmission = async (foodData: { foodType: string; calories: number; weight: number; emoji?: string }) => {
    addLog(`Food submitted: ${foodData.emoji} ${foodData.foodType} (${foodData.calories} kcal, ${foodData.weight}g)`);
    addLog('✅ Food logged successfully! Redirecting to main page...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">🍎 Final Camera Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Test the complete camera flow with food analysis
              </p>
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={() => {
                  addLog('Opening camera...');
                  setShowCamera(true);
                }}
                className="w-48"
              >
                Open Camera
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Expected Flow</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span>1.</span>
                    <span>Click "Open Camera"</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>2.</span>
                    <span>Allow camera permission</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>3.</span>
                    <span>See live camera feed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>4.</span>
                    <span>Click "Take Photo"</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>5.</span>
                    <span>Click "Analyze Food"</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>6.</span>
                    <span>See food analysis summary</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>7.</span>
                    <span>Click "Submit Food"</span>
                  </div>
                </div>
              </div>
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
