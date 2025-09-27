'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw, Check, Camera } from 'lucide-react';

export default function CameraDebugButtonsPage() {
  const [showPreview, setShowPreview] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const retakePhoto = () => {
    console.log('Retake clicked');
    setShowPreview(false);
    setIsAnalyzing(false);
  };

  const analyzePhoto = () => {
    console.log('Analyze clicked');
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">🔧 Button Debug Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Test button rendering and styling
              </p>
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={() => setShowPreview(!showPreview)}
                className="w-48"
              >
                Toggle Preview
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Camera View (No Preview)</h3>
                <div className="bg-black rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="text-center text-white mb-2">
                      <p className="text-sm">Point camera at your food</p>
                    </div>
                    <div className="flex gap-4">
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        Take Photo
                      </Button>
                      <Button variant="outline" className="flex-1 text-white border-white hover:bg-white/10">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Preview View</h3>
                <div className="bg-black rounded-lg p-4">
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
                      variant="ghost" 
                      className="w-full text-white hover:bg-white/10"
                      disabled={isAnalyzing}
                    >
                      Cancel
                    </Button>
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