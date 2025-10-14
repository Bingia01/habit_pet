'use client';

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, RotateCcw, Check, ArrowLeft } from 'lucide-react';
import { FoodSelectionModal } from './FoodSelectionModal';

interface FoodAnalysis {
  foodType: string;
  confidence: number;
  calories: number;
  weight: number; // in grams
  emoji?: string;
}

interface FinalCameraCaptureProps {
  onCapture: (foodData: FoodAnalysis) => Promise<void>;
  onClose: () => void;
}

export function FinalCameraCapture({ onCapture, onClose }: FinalCameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const capturedImageRef = useRef<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string>('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [foodAnalysis, setFoodAnalysis] = useState<FoodAnalysis | null>(null);
  const [isRestarting, setIsRestarting] = useState(false);
  const [showFoodSelection, setShowFoodSelection] = useState(false);

  // Start camera when component mounts
  useEffect(() => {
    console.log('FinalCameraCapture mounted');
    startCamera();

    return () => {
      console.log('FinalCameraCapture unmounting');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (capturedImageRef.current) {
        URL.revokeObjectURL(capturedImageRef.current);
        capturedImageRef.current = null;
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setError('');
      console.log('Starting camera...');

      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera access is not supported in this browser. Please try Safari or Chrome.');
        return;
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      let mediaStream: MediaStream;

      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (constraintError) {
        console.warn('Advanced constraints failed, falling back to default camera request', constraintError);
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      console.log('Stream obtained:', mediaStream);

      setStream(mediaStream);
      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('autoplay', 'true');
        videoRef.current.setAttribute('muted', 'true');
        console.log('Video source set');

        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          videoRef.current?.play();
        };
      }
    } catch (error) {
      console.error('Camera error:', error);
      let message = 'Camera error. Please check permissions and try again.';
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          message = 'Camera permission denied. Please allow camera access in your browser settings.';
        } else if (error.name === 'NotFoundError') {
          message = 'No camera device found. Try connecting a camera or using a different device.';
        } else if (error.name === 'NotReadableError') {
          message = 'Camera is already in use by another application. Close other apps using the camera.';
        }
      }
      setError(message);
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
        if (capturedImageRef.current) {
          URL.revokeObjectURL(capturedImageRef.current);
        }
        const imageUrl = URL.createObjectURL(blob);
        setShowPreview(true);
        setIsCapturing(false);
        capturedImageRef.current = imageUrl;
        setCapturedImage(imageUrl);
      }
    }, 'image/jpeg', 0.8);
  };

  const analyzePhoto = async () => {
    if (!canvasRef.current) return;
    
    setIsAnalyzing(true);
    
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (blob) {
          try {
            // Call real AI analysis API
            const formData = new FormData();
            formData.append('image', blob, 'food.jpg');
            
            // Try the simple API first (no external dependencies)
            const response = await fetch('/api/analyze-food', {
              method: 'POST',
              body: formData,
            });
            
            if (!response.ok) {
              throw new Error('Analysis failed');
            }
            
            const result = await response.json();
            
            const realAnalysis: FoodAnalysis = {
              foodType: result.foodType || 'Unknown Food',
              confidence: result.confidence || 0.5,
              calories: result.calories || 100,
              weight: result.weight || 100 // grams
            };
            
            setFoodAnalysis(realAnalysis);
            setShowAnalysis(true);
            setIsAnalyzing(false);
          } catch (error) {
            console.error('AI Analysis failed:', error);
            // Fallback to mock data if API fails
            const fallbackAnalysis: FoodAnalysis = {
              foodType: 'Food Item',
              confidence: 0.7,
              calories: 150,
              weight: 120
            };
            setFoodAnalysis(fallbackAnalysis);
            setShowAnalysis(true);
            setIsAnalyzing(false);
          }
        }
      }, 'image/jpeg', 0.8);
    } catch (error) {
      console.error('Analysis failed:', error);
      setIsAnalyzing(false);
    }
  };

  const submitFood = async () => {
    if (!foodAnalysis) return;
    
    try {
      await onCapture(foodAnalysis);
      // Camera will be closed by parent component after successful submission
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  const retakePhoto = async () => {
    if (capturedImageRef.current) {
      URL.revokeObjectURL(capturedImageRef.current);
      capturedImageRef.current = null;
    }
    setCapturedImage(null);
    setShowPreview(false);
    setShowAnalysis(false);
    setFoodAnalysis(null);
    setIsCapturing(false);
    setIsAnalyzing(false);
    
    // Restart camera if stream was stopped
    if (!stream) {
      setIsRestarting(true);
      try {
        await startCamera();
      } finally {
        setIsRestarting(false);
      }
    }
  };

  const backToPreview = () => {
    setShowAnalysis(false);
    
    // Ensure camera stream is still active
    if (!stream) {
      startCamera();
    }
  };

  const handleFoodSelection = (selectedFood: { name: string; calories: number; weight: number; emoji: string }) => {
    const updatedAnalysis: FoodAnalysis = {
      foodType: selectedFood.name,
      confidence: 1.0, // User confirmed, so 100% confidence
      calories: selectedFood.calories,
      weight: selectedFood.weight,
      emoji: selectedFood.emoji
    };
    
    setFoodAnalysis(updatedAnalysis);
    setShowFoodSelection(false);
    setShowAnalysis(true);
  };

  const openFoodSelection = () => {
    setShowFoodSelection(true);
  };

  const stopCamera = () => {
    console.log('stopCamera called');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    if (capturedImageRef.current) {
      URL.revokeObjectURL(capturedImageRef.current);
      capturedImageRef.current = null;
    }
    if (capturedImage) {
      setCapturedImage(null);
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
    <div className="fixed inset-0 bg-black z-50 flex flex-col max-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center p-3 bg-black/50 flex-shrink-0">
        <Button variant="ghost" onClick={stopCamera} className="text-white">
          <X className="w-6 h-6" />
        </Button>
        <h2 className="text-white text-lg font-semibold">Capture Food</h2>
        <div className="w-6" />
      </div>

      {/* Camera View - Fixed height to leave room for buttons */}
      <div className="flex-1 relative min-h-0">
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
            <div className="absolute inset-2 border-2 border-white/50 rounded-lg pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-green-400 rounded pointer-events-none" />
            
            {/* Instructions */}
            <div className="absolute top-2 left-2 right-2 text-center">
              {isRestarting ? (
                <p className="text-white bg-blue-500/50 px-3 py-1 rounded-full text-sm">
                  Restarting camera...
                </p>
              ) : (
                <p className="text-white bg-black/50 px-3 py-1 rounded-full text-sm">
                  Point camera at your food
                </p>
              )}
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

      {/* Controls - Always visible at bottom with fixed height */}
      <div className="p-3 bg-black/50 flex-shrink-0">
        {!showPreview ? (
          // Camera View Controls
          <div className="space-y-3">
            {stream && (
              <div className="text-center text-green-400 mb-2">
                <p className="text-sm">✅ Camera active</p>
              </div>
            )}
            <div className="flex gap-2">
              <Button 
                onClick={capturePhoto} 
                disabled={isCapturing || !stream}
                className="flex-1 bg-green-600 hover:bg-green-700 h-10"
              >
                {isCapturing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Capturing...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={stopCamera} 
                className="flex-1 text-white border-white hover:bg-white/10 bg-transparent h-10"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : !showAnalysis ? (
          // Preview Controls
          <div className="space-y-3">
            <div className="text-center text-white mb-2">
              <p className="text-sm">Review your photo. Is it clear?</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={analyzePhoto}
                disabled={isAnalyzing}
                className="flex-1 bg-green-600 hover:bg-green-700 h-10"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Analyze Food
                  </>
                )}
              </Button>
              <Button 
                onClick={retakePhoto}
                variant="outline" 
                className="flex-1 text-white border-white hover:bg-white/10 bg-transparent h-10"
                disabled={isAnalyzing}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
            </div>
            <Button 
              onClick={stopCamera}
              variant="ghost" 
              className="w-full text-white hover:bg-white/10 h-8"
              disabled={isAnalyzing}
            >
              Cancel
            </Button>
          </div>
        ) : (
          // Analysis Summary Controls - Just show retake option
          <div className="space-y-3">
            <div className="text-center text-white mb-2">
              <p className="text-sm">Review the analysis above</p>
            </div>
            <Button 
              onClick={retakePhoto}
              variant="ghost" 
              className="w-full text-white hover:bg-white/10 h-8"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Take New Photo
            </Button>
          </div>
        )}
      </div>

      {/* Food Analysis Summary - Overlay */}
      {showAnalysis && foodAnalysis && (
        <div className="absolute inset-2 bg-black/80 rounded-lg p-3 flex flex-col justify-center">
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-lg">🍎 Food Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <h3 className="text-xl font-bold text-green-600">{foodAnalysis.foodType}</h3>
                <p className="text-xs text-gray-500">Confidence: {Math.round(foodAnalysis.confidence * 100)}%</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Calories</p>
                  <p className="text-lg font-bold text-orange-600">{foodAnalysis.calories}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Weight</p>
                  <p className="text-lg font-bold text-blue-600">{foodAnalysis.weight}g</p>
                </div>
              </div>
              
                     <div className="text-center text-xs text-gray-600 mb-3">
                       <p>Is this correct?</p>
                     </div>
                     
                     <div className="flex gap-2">
                       <Button 
                         onClick={submitFood}
                         className="flex-1 bg-green-600 hover:bg-green-700 h-8 text-sm"
                       >
                         Yes, Submit
                       </Button>
                       <Button 
                         onClick={openFoodSelection}
                         variant="outline" 
                         className="flex-1 text-blue-600 border-blue-300 hover:bg-blue-50 h-8 text-sm"
                       >
                         Wrong? Select Different
                       </Button>
                     </div>
                     
                     <Button 
                       onClick={backToPreview}
                       variant="ghost" 
                       className="w-full text-gray-500 hover:bg-gray-50 h-6 text-xs"
                     >
                       Back to Preview
                     </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Food Selection Modal */}
      {showFoodSelection && foodAnalysis && (
        <FoodSelectionModal
          isOpen={showFoodSelection}
          onClose={() => setShowFoodSelection(false)}
          onSelect={handleFoodSelection}
          currentGuess={{
            name: foodAnalysis.foodType,
            calories: foodAnalysis.calories,
            weight: foodAnalysis.weight,
            emoji: foodAnalysis.emoji || '🍽️'
          }}
        />
      )}
    </div>
  );
}
