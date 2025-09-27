'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CameraIsolatedPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const startCamera = async () => {
    try {
      addLog('Starting camera...');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported');
      }
      
      addLog('Requesting camera permission...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      addLog(`Stream obtained: ${mediaStream.id}`);
      addLog(`Stream active: ${mediaStream.active}`);
      addLog(`Tracks: ${mediaStream.getTracks().length}`);
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        addLog('Video source set');
        
        videoRef.current.onloadedmetadata = () => {
          addLog('Video metadata loaded');
          videoRef.current?.play().then(() => {
            addLog('Video playing successfully');
          }).catch(err => {
            addLog(`Video play error: ${err.message}`);
          });
        };
        
        videoRef.current.onerror = (e) => {
          addLog(`Video error: ${e}`);
        };
      }
    } catch (error) {
      addLog(`Camera error: ${error.message || error}`);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      addLog('Camera stopped');
    }
    setShowCamera(false);
  };

  const openCamera = () => {
    addLog('Opening camera component...');
    setShowCamera(true);
    // Start camera after a small delay
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">🔧 Isolated Camera Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Test camera component isolation
              </p>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button onClick={openCamera} disabled={showCamera}>
                Open Camera
              </Button>
              <Button onClick={stopCamera} variant="outline" disabled={!showCamera}>
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
                <h3 className="text-lg font-semibold mb-2">Status</h3>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <p><strong>Camera Open:</strong> {showCamera ? '✅ Yes' : '❌ No'}</p>
                  <p><strong>Stream:</strong> {stream ? '✅ Active' : '❌ None'}</p>
                  <p><strong>Tracks:</strong> {stream?.getTracks().length || 0}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Camera Overlay */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex justify-between items-center p-4 bg-black/50">
            <h2 className="text-white text-lg font-semibold">Camera Test</h2>
            <Button 
              onClick={stopCamera}
              variant="ghost"
              className="text-white"
            >
              Close
            </Button>
          </div>
          
          <div className="flex-1 bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
          </div>
          
          <div className="p-4 bg-black/50">
            <div className="text-center text-white">
              <p className="text-sm">Camera should be working here</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
