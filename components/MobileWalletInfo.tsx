"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Smartphone, ExternalLink, Info } from 'lucide-react';
import { isMobileDevice, getMetaMaskDownloadLink, generateMetaMaskDeepLink } from '@/lib/web3';

interface MobileWalletInfoProps {
  onClose: () => void;
}

export default function MobileWalletInfo({ onClose }: MobileWalletInfoProps) {
  if (!isMobileDevice()) return null;

  const handleOpenMetaMaskApp = () => {
    const deepLink = generateMetaMaskDeepLink();
    window.location.href = deepLink;
  };

  const handleDownloadMetaMask = () => {
    const downloadLink = getMetaMaskDownloadLink();
    window.open(downloadLink, '_blank');
  };

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 bg-gradient-to-r from-purple-900/90 to-blue-900/90 border-purple-400 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-purple-400" />
            <h3 className="text-white font-medium">Connect with MetaMask Mobile</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-3 text-sm text-gray-300">
          <p>To connect your wallet on mobile, you have two options:</p>
          
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-purple-400 font-bold">1.</span>
              <div>
                <p className="text-white">Use MetaMask Browser</p>
                <p className="text-xs">Open this site in the MetaMask app browser</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="text-purple-400 font-bold">2.</span>
              <div>
                <p className="text-white">Install MetaMask App</p>
                <p className="text-xs">Download from your device's app store</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-2 mt-4">
            <Button
              onClick={handleOpenMetaMaskApp}
              size="sm"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Open MetaMask App
            </Button>
            
            <Button
              onClick={handleDownloadMetaMask}
              variant="outline"
              size="sm"
              className="flex-1 border-purple-400 text-purple-300 hover:bg-purple-900/50"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Download App
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
