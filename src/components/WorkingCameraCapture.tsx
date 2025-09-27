'use client';

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, RotateCcw, Check } from 'lucide-react';

interface WorkingCameraCaptureProps {
  onCapture: (imageBlob: Blob) => Promise<void>;
  onClose: () => void;
}

export function WorkingCameraCapture({ onCapture, onClose }: WorkingCameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string>('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Start camera when component mounts
  useEffect(() => {
    console.log('WorkingCameraCapture mounted');
    startCamera();
    
    return () => {
      console.log('WorkingCameraCapture unmounting');
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setError('');
      console.log('Starting camera...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      console.log('Stream obtained:', mediaStream);
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        console.log('Video source set');
        
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          videoRef.current?.play();
        };
      }
    } catch (error) {
      console.error('Camera error:', error);
      setError(`Camera error: ${error.message || error}`);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      setIsCapturing(false);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        setShowPreview(true);
        setIsCapturing(false);
      }
    }, 'image/jpeg', 0.8);
  };

  const analyzePhoto = async () => {
    if (!canvasRef.current) return;
    
    setIsAnalyzing(true);
    
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (blob) {
          await onCapture(blob);
          onClose();
        }
      }, 'image/jpeg', 0.8);
    } catch (error) {
      console.error('Analysis failed:', error);
      setIsAnalyzing(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setShowPreview(false);
    setIsCapturing(false);
    setIsAnalyzing(false);
  };

  const stopCamera = () => {
    console.log('stopCamera called');
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    onClose();
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Camera Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-2">
            <Button onClick={startCamera} className="flex-1">
              Try Again
            </Button>
            <Button variant="outline" onClick={stopCamera} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black/50">
        <Button variant="ghost" onClick={stopCamera} className="text-white">
          <X className="w-6 h-6" />
        </Button>
        <h2 className="text-white text-lg font-semibold">Capture Food</h2>
        <div className="w-6" />
      </div>

      {/* Camera View */}
      <div className="flex-1 relative">
        {!showPreview ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            
            {/* Camera overlay */}
            <div className="absolute inset-4 border-2 border-white/50 rounded-lg pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-green-400 rounded pointer-events-none" />
            
            {/* Instructions */}
            <div className="absolute top-4 left-4 right-4 text-center">
              <p className="text-white bg-black/50 px-3 py-1 rounded-full text-sm">
                Point camera at your food
              </p>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black">
            <img 
              src={capturedImage} 
              alt="Captured food" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="p-6 bg-black/50">
        {!showPreview ? (
          <div className="space-y-3">
            {stream && (
              <div className="text-center text-green-400 mb-2">
                <p className="text-sm">✅ Camera active</p>
              </div>
            )}
            <div className="flex gap-4">
              <Button 
                onClick={capturePhoto} 
                disabled={isCapturing || !stream}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isCapturing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Capturing...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5 mr-2" />
                    Take Photo
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={stopCamera} className="flex-1 text-white border-white hover:bg-white/10">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-center text-white mb-2">
              <p className="text-sm">Review your photo. Is it clear?</p>
            </div>
            <div className="flex gap-4">
              <Button 
                onClick={analyzePhoto}
                disabled={isAnalyzing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Analyze Food
                  </>
                )}
              </Button>
              <Button 
                onClick={retakePhoto}
                variant="outline" 
                className="flex-1 text-white border-white hover:bg-white/10 bg-transparent"
                disabled={isAnalyzing}
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Retake
              </Button>
            </div>
            <Button 
              onClick={stopCamera}
              variant="ghost" 
              className="w-full text-white hover:bg-white/10"
              disabled={isAnalyzing}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
