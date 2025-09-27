'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAIAPIPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const checkAPIKey = async () => {
    addLog('Checking Clarifai API key...');
    
    try {
      const response = await fetch('/api/check-clarifai');
      const result = await response.json();
      
      if (response.ok) {
        addLog(`✅ API Key Status: ${result.status}`);
        if (result.keyLength > 0) {
          addLog(`✅ API Key Length: ${result.keyLength} characters`);
          addLog(`✅ API Key Preview: ${result.keyPreview}`);
        } else {
          addLog(`✅ ${result.message}`);
        }
      } else {
        addLog(`❌ API Key Error: ${result.error}`);
      }
    } catch (error) {
      addLog(`❌ Check failed: ${error}`);
    }
  };

  const testAPI = async () => {
    setIsLoading(true);
    addLog('Testing AI API...');
    
    try {
      // Create a simple test image (1x1 pixel)
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 1, 1);
      }
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          const formData = new FormData();
          formData.append('image', blob, 'test.jpg');
          
          addLog('Sending request to /api/analyze-food-simple...');
          
          const response = await fetch('/api/analyze-food-simple', {
            method: 'POST',
            body: formData,
          });
          
          addLog(`Response status: ${response.status}`);
          
          if (response.ok) {
            const result = await response.json();
            addLog(`✅ API Response: ${JSON.stringify(result, null, 2)}`);
          } else {
            const error = await response.text();
            addLog(`❌ API Error: ${error}`);
          }
        }
        setIsLoading(false);
      }, 'image/jpeg', 0.8);
    } catch (error) {
      addLog(`❌ Test failed: ${error}`);
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">🤖 AI API Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Test the Clarifai food recognition API
              </p>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={checkAPIKey}
                variant="outline"
                className="w-48"
              >
                Check API Key
              </Button>
              <Button 
                onClick={testAPI}
                disabled={isLoading}
                className="w-48"
              >
                {isLoading ? 'Testing...' : 'Test API'}
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
                <h3 className="text-lg font-semibold mb-2">Setup Checklist</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span>1.</span>
                    <span>CLARIFAI_API_KEY in .env.local</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>2.</span>
                    <span>API route working</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>3.</span>
                    <span>Clarifai API accessible</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>4.</span>
                    <span>Response format correct</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
