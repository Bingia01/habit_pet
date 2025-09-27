'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SimpleCameraPage() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    try {
      setError('');
      console.log('Starting camera...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true
      });
      
      console.log('Stream obtained:', mediaStream);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        console.log('Video element updated');
      }
    } catch (error) {
      console.error('Camera error:', error);
      setError(`Camera error: ${error}`);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Simple Camera Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full h-64 bg-black rounded-lg flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
            </div>
            
            <div className="flex gap-4">
              <Button onClick={startCamera} disabled={!!stream}>
                Start Camera
              </Button>
              <Button onClick={stopCamera} disabled={!stream} variant="outline">
                Stop Camera
              </Button>
            </div>
            
            {error && (
              <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700">
                {error}
              </div>
            )}
            
            <div className="text-sm text-gray-600">
              <p><strong>Status:</strong> {stream ? 'Camera active' : 'No camera'}</p>
              <p><strong>Stream tracks:</strong> {stream?.getTracks().length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
