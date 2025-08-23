"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

export default function NetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [blockNumber, setBlockNumber] = useState(0);

  useEffect(() => {
    // Mock network status checking
    const interval = setInterval(() => {
      // In a real app, this would check actual network status
      setBlockNumber(prev => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge
        className={`${
          isConnected
            ? 'bg-green-600/90 text-white border-green-500/50'
            : 'bg-red-600/90 text-white border-red-500/50'
        } backdrop-blur-sm`}
      >
        {isConnected ? (
          <>
            <Wifi className="h-3 w-3 mr-1" />
            Somnia Testnet
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3 mr-1" />
            Disconnected
          </>
        )}
      </Badge>
      
      {isConnected && (
        <div className="text-xs text-gray-400 mt-1 text-center">
          Block #{blockNumber.toLocaleString()}
        </div>
      )}
    </div>
  );
}