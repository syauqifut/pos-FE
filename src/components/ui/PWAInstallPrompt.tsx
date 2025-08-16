import React, { useState } from 'react';
import Button from './Button';
import { X, Download, Smartphone, CheckCircle } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

interface PWAInstallPromptProps {
  className?: string;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ className = '' }) => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await installApp();
      if (success) {
        // Installation successful, hide prompt
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  // Don't show if not installable, already installed, or dismissed
  if (!isInstallable || isInstalled || !showPrompt) return null;

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Smartphone className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">Install POS App</h3>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Install this app on your device for quick and easy access when you're on the go. It works offline and feels like a native app.
      </p>
      
      <div className="flex space-x-3">
        <Button
          onClick={handleInstall}
          disabled={isInstalling}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          {isInstalling ? (
            <>
              <Download className="w-4 h-4 mr-2 animate-spin" />
              Installing...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Install App
            </>
          )}
        </Button>
        
        <Button
          onClick={handleDismiss}
          variant="outline"
          className="flex-1"
        >
          Not Now
        </Button>
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>Works offline</span>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>Fast loading</span>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>Native app feel</span>
        </div>
      </div>
    </div>
  );
};
