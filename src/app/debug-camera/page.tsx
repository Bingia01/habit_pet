'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, AlertCircle, CheckCircle } from 'lucide-react';

export default function DebugCameraPage() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const startCamera = async () => {
    try {
      setError('');
      addLog('Starting camera...');
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }
      
      addLog('getUserMedia is supported');
      
      // Try to get camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      addLog('Camera stream obtained successfully');
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        addLog('Video started playing');
      }
    } catch (error) {
      console.error('Camera error:', error);
      let errorMessage = 'Unknown camera error';
      
      if (error instanceof Error) {
        addLog(`Error: ${error.name} - ${error.message}`);
        
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please allow camera access.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found on this device.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Camera not supported on this device.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      addLog(`Error message: ${errorMessage}`);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      addLog('Camera stopped');
    }
  };

  const checkBrowserSupport = () => {
    addLog('Checking browser support...');
    addLog(`navigator.mediaDevices: ${!!navigator.mediaDevices}`);
    addLog(`getUserMedia: ${!!navigator.mediaDevices?.getUserMedia}`);
    addLog(`User Agent: ${navigator.userAgent}`);
    addLog(`HTTPS: ${location.protocol === 'https:'}`);
    addLog(`Localhost: ${location.hostname === 'localhost'}`);
  };

  useEffect(() => {
    checkBrowserSupport();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">🔧 Camera Debug Tool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Camera Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Camera Test</h3>
                
                <div className="w-full h-64 bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
                  {stream ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-white">
                      <Camera className="w-16 h-16 mx-auto mb-2" />
                      <p>No camera stream</p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={startCamera}
                    disabled={!!stream}
                    className="flex-1"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Start Camera
                  </Button>
                  <Button 
                    onClick={stopCamera}
                    disabled={!stream}
                    variant="outline"
                    className="flex-1"
                  >
                    Stop Camera
                  </Button>
                </div>
                
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-red-800 font-medium">Error:</span>
                    </div>
                    <p className="text-red-700 mt-1">{error}</p>
                  </div>
                )}
                
                {stream && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-800 font-medium">Camera Active</span>
                    </div>
                    <p className="text-green-700 mt-1">Camera stream is working!</p>
                  </div>
                )}
              </div>
              
              {/* Debug Logs */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Debug Logs</h3>
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
                >
                  Clear Logs
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Common Issues:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Permission Denied:</strong> Click the camera icon in your browser's address bar and allow camera access</li>
                <li><strong>No Camera Found:</strong> Make sure you have a camera connected</li>
                <li><strong>HTTPS Required:</strong> Camera access requires HTTPS (localhost is OK)</li>
                <li><strong>Browser Support:</strong> Use Chrome, Firefox, Safari, or Edge</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
