'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Settings } from 'lucide-react';

interface CameraErrorDisplayProps {
  error: string;
  errorCode?: string;
  onRetry?: () => void;
  onClose?: () => void;
}

export function CameraErrorDisplay({
  error,
  errorCode,
  onRetry,
  onClose,
}: CameraErrorDisplayProps) {
  const getErrorMessage = () => {
    if (errorCode === 'NO_IMAGE') {
      return 'No image was captured. Please try taking the photo again.';
    }
    if (errorCode === 'TIMEOUT') {
      return 'The analysis took too long. Please check your internet connection and try again.';
    }
    if (errorCode === 'NETWORK_ERROR') {
      return 'Network error. Please check your internet connection and try again.';
    }
    if (errorCode === 'CONFIG_ERROR') {
      return 'Server configuration error. Please contact support or try again later.';
    }
    if (errorCode === 'ABORTED') {
      return 'Request was cancelled. This usually happens when navigating away. You can try again.';
    }
    return error || 'An unexpected error occurred.';
  };

  const getErrorTitle = () => {
    if (errorCode === 'NO_IMAGE') return 'No Image Captured';
    if (errorCode === 'TIMEOUT') return 'Request Timeout';
    if (errorCode === 'NETWORK_ERROR') return 'Network Error';
    if (errorCode === 'CONFIG_ERROR') return 'Configuration Error';
    if (errorCode === 'ABORTED') return 'Request Cancelled';
    return 'Analysis Error';
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <CardTitle className="text-red-600">{getErrorTitle()}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">{getErrorMessage()}</p>

          {errorCode && (
            <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
              Error Code: <code className="font-mono">{errorCode}</code>
            </div>
          )}

          <div className="flex gap-2">
            {onRetry && (
              <Button onClick={onRetry} className="flex-1" variant="default">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            )}
            {onClose && (
              <Button onClick={onClose} variant="outline" className="flex-1">
                Close
              </Button>
            )}
          </div>

          {errorCode === 'CONFIG_ERROR' && (
            <div className="text-xs text-gray-600 bg-yellow-50 p-3 rounded border border-yellow-200">
              <p className="font-semibold mb-1">Configuration Issue:</p>
              <p>
                The server may be missing required API keys. This is a server-side configuration
                issue.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



