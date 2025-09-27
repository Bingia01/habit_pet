'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SimpleCameraCapture } from '@/components/SimpleCameraCapture';
import { Camera, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function TestCameraPage() {
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const analyzeFoodImage = async (imageBlob: Blob) => {
    setIsAnalyzing(true);
    setError('');
    setAnalysisResult(null);
    
    try {
      const formData = new FormData();
      formData.append('image', imageBlob);

      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.food) {
        setAnalysisResult(result.food);
      } else {
        setError(result.message || 'Failed to analyze food');
      }
    } catch (error) {
      console.error('Food analysis failed:', error);
      setError('Network error. Please check your API key and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetTest = () => {
    setAnalysisResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">📸 Camera & AI Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Test your camera and AI food recognition system
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => setShowCamera(true)}
                className="w-full"
                disabled={isAnalyzing}
              >
                <Camera className="w-5 h-5 mr-2" />
                Open Camera & Test AI
              </Button>
              
              {(analysisResult || error) && (
                <Button 
                  onClick={resetTest}
                  variant="outline"
                  className="w-full"
                >
                  Reset Test
                </Button>
              )}
            </div>
            
            {/* Analysis Results */}
            {isAnalyzing && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="text-blue-600">Analyzing food image...</span>
                </div>
              </div>
            )}

            {analysisResult && (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Analysis Successful!</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{analysisResult.emoji}</span>
                    <div>
                      <p className="font-semibold">{analysisResult.name}</p>
                      <p className="text-sm text-gray-600">
                        Confidence: {analysisResult.confidence}%
                      </p>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    {analysisResult.calories} calories
                  </div>
                  {analysisResult.portionSizes && analysisResult.portionSizes.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Portion Options:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {analysisResult.portionSizes.map((portion: string, index: number) => (
                          <li key={index}>• {portion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-800">Analysis Failed</span>
                </div>
                <p className="text-red-700">{error}</p>
              </div>
            )}
            
            <div className="text-sm text-gray-500 space-y-2">
              <p><strong>What this tests:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Camera access and photo capture</li>
                <li>Image upload to API</li>
                <li>AI food recognition</li>
                <li>Calorie estimation</li>
                <li>Portion size suggestions</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>🔧 Setup Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <span>1.</span>
                <span>Get Clarifai API key (free at clarifai.com)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>2.</span>
                <span>Add CLARIFAI_API_KEY to .env.local</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>3.</span>
                <span>Test camera permissions</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>4.</span>
                <span>Test AI food recognition (this page)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Camera Component */}
      {showCamera && (
        <SimpleCameraCapture
          onCapture={analyzeFoodImage}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
