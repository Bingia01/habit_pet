'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CheckClarifaiPage() {
  const [logs, setLogs] = useState<string[]>([]);

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
        addLog(`✅ API Key Length: ${result.keyLength} characters`);
        addLog(`✅ API Key Preview: ${result.keyPreview}`);
      } else {
        addLog(`❌ API Key Error: ${result.error}`);
      }
    } catch (error) {
      addLog(`❌ Check failed: ${error}`);
    }
  };

  const testSimpleAPI = async () => {
    addLog('Testing simple Clarifai API call...');
    
    try {
      const response = await fetch('/api/test-clarifai');
      const result = await response.json();
      
      if (response.ok) {
        addLog(`✅ Simple API Test: ${result.message}`);
      } else {
        addLog(`❌ Simple API Error: ${result.error}`);
      }
    } catch (error) {
      addLog(`❌ Simple API failed: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">🔑 Clarifai API Check</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Check if Clarifai API key is properly configured
              </p>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={checkAPIKey}
                className="w-48"
              >
                Check API Key
              </Button>
              <Button 
                onClick={testSimpleAPI}
                variant="outline"
                className="w-48"
              >
                Test Simple API
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
                <h3 className="text-lg font-semibold mb-2">Setup Steps</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span>1.</span>
                    <span>Get Clarifai API key from clarifai.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>2.</span>
                    <span>Add to .env.local file</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>3.</span>
                    <span>Restart development server</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>4.</span>
                    <span>Test API connection</span>
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
