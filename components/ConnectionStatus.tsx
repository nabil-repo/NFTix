"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Smartphone, Wifi } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  isLoading: boolean;
  isMobile: boolean;
  address?: string;
}

export default function ConnectionStatus({ isConnected, isLoading, isMobile, address }: ConnectionStatusProps) {
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    if (isLoading || isConnected) {
      setShowStatus(true);
      
      if (isConnected) {
        // Auto-hide success message after 3 seconds
        const timer = setTimeout(() => {
          setShowStatus(false);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, isConnected]);

  if (!showStatus) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className="bg-gray-900/95 border-gray-700 backdrop-blur-sm">
        <CardContent className="p-3">
          {isLoading ? (
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-400 border-t-transparent"></div>
              <div>
                <p className="text-white text-sm font-medium">
                  {isMobile ? 'Connecting via MetaMask Mobile...' : 'Connecting Wallet...'}
                </p>
                <p className="text-gray-400 text-xs">
                  {isMobile ? 'Check your MetaMask app' : 'Approve the connection in MetaMask'}
                </p>
              </div>
              {isMobile && <Smartphone className="h-4 w-4 text-purple-400" />}
            </div>
          ) : isConnected ? (
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-white text-sm font-medium">Wallet Connected!</p>
                <p className="text-gray-400 text-xs">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected to Somnia Testnet'}
                </p>
              </div>
              <Wifi className="h-4 w-4 text-green-400" />
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-white text-sm font-medium">Connection Failed</p>
                <p className="text-gray-400 text-xs">
                  {isMobile ? 'Try using MetaMask browser' : 'Please install MetaMask'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
