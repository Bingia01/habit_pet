'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SimpleCameraCapture } from '@/components/SimpleCameraCapture';

export default function CameraDebugPage() {
  const [showCamera, setShowCamera] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const analyzeFoodImage = async (imageBlob: Blob) => {
    addLog('Food analysis started...');
    addLog(`Image size: ${imageBlob.size} bytes`);
    addLog('Analysis complete!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">🔧 Camera Debug - Full Flow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Test the complete camera flow with debugging
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
                    <span>Click &quot;Open Camera&quot;</span>
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
                    <span>See &quot;Take Photo&quot; button</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>5.</span>
                    <span>Take photo and see preview</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Camera Component */}
      {showCamera && (
        <SimpleCameraCapture
          onCapture={analyzeFoodImage}
          onClose={() => {
            addLog('Camera closed');
            setShowCamera(false);
          }}
        />
      )}
    </div>
  );
}
