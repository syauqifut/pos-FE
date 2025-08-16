import React, { useEffect, useState } from 'react';
import Button from './Button';
import { X, Download, RefreshCw } from 'lucide-react';

interface PWAUpdatePromptProps {
  className?: string;
}

export const PWAUpdatePrompt: React.FC<PWAUpdatePromptProps> = ({ className = '' }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Check if PWA is supported
    if ('serviceWorker' in navigator && 'UpdateEvent' in window) {
      // Listen for service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setShowPrompt(true);
      });

      // Check for updates
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      }
    }
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      // Reload the page to apply the update
      window.location.reload();
    } catch (error) {
      console.error('Error updating PWA:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Download className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Update Available</h3>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        A new version of the POS application is available. Update now to get the latest features and improvements.
      </p>
      
      <div className="flex space-x-3">
        <Button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isUpdating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Update Now
            </>
          )}
        </Button>
        
        <Button
          onClick={handleDismiss}
          variant="outline"
          className="flex-1"
        >
          Later
        </Button>
      </div>
    </div>
  );
};
