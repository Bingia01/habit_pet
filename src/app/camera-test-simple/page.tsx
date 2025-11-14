'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CameraTestSimplePage() {
  const [showCamera, setShowCamera] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">🔧 Simple Camera Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Test if the camera component stays open
              </p>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => {
                  addLog('Opening camera...');
                  setShowCamera(true);
                }}
                className="w-48"
              >
                Open Camera
              </Button>
              <Button 
                onClick={() => {
                  addLog('Closing camera...');
                  setShowCamera(false);
                }}
                variant="outline"
                className="w-48"
              >
                Close Camera
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
                <h3 className="text-lg font-semibold mb-2">Camera Status</h3>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <p><strong>Camera Open:</strong> {showCamera ? '✅ Yes' : '❌ No'}</p>
                  <p><strong>Expected:</strong> Camera should stay open until you click &quot;Close Camera&quot;</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simple Camera Test */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex justify-between items-center p-4 bg-black/50">
            <h2 className="text-white text-lg font-semibold">Test Camera</h2>
            <Button 
              onClick={() => {
                addLog('Camera closed by user');
                setShowCamera(false);
              }}
              variant="ghost"
              className="text-white"
            >
              Close
            </Button>
          </div>
          <div className="flex-1 bg-gray-800 flex items-center justify-center">
            <div className="text-white text-center">
              <p className="text-2xl mb-4">📷</p>
              <p>Camera component is open!</p>
              <p className="text-sm mt-2">This should stay open until you click Close</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
