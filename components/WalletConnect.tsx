"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, ExternalLink, Smartphone } from 'lucide-react';
import { connectWallet, SOMNIA_TESTNET, isMobileDevice, isMetaMaskMobileBrowser, connectMobileWallet } from '@/lib/web3';
import ConnectionStatus from './ConnectionStatus';

export default function WalletConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [showMobileInfo, setShowMobileInfo] = useState(false);

  useEffect(() => {
    checkConnection();
    detectMobile();
    detectMetaMask();
  }, []);

  const detectMobile = () => {
    setIsMobile(isMobileDevice());
  };

  const detectMetaMask = () => {
    setHasMetaMask(typeof window.ethereum !== 'undefined' || isMetaMaskMobileBrowser());
  };

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });
        if (accounts.length > 0) {
          setIsConnected(true);
          setAddress(accounts[0]);
        }
      } catch (error) {
        console.error('Failed to check connection:', error);
      }
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      if (isMobile) {
        // Use mobile-specific connection
        const account = await connectMobileWallet();
        setIsConnected(true);
        setAddress(account);
      } else {
        // Standard desktop connection
        const account = await connectWallet();
        setIsConnected(true);
        setAddress(account);
      }
    } catch (error: any) {
      console.error('Connection failed:', error);

      if (error.message.includes('Redirecting to MetaMask app')) {
        // Don't show error for redirect
        return;
      }

      if (isMobile) {
        alert('Please install MetaMask mobile app or use the browser within MetaMask app.');
      } else {
        alert('Failed to connect wallet. Please make sure MetaMask is installed.');
      }
      if (isMobile && !hasMetaMask && !isLoading) {
        setShowMobileInfo(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setAddress('');
  };

  if (isConnected) {
    return (
      <>
        <div className="flex items-center space-x-3">
          <div className="text-sm">
            <div className="text-white font-medium">
              {address.slice(0, 6)}...{address.slice(-4)}
            </div>
            <div className="text-gray-400 text-xs">Somnia Testnet</div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            className="border-purple-400 text-purple-300 hover:bg-purple-900/50"
          >
            Disconnect
          </Button>
        </div>

        <ConnectionStatus
          isConnected={isConnected}
          isLoading={isLoading}
          isMobile={isMobile}
          address={address}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        <Button
          onClick={handleConnect}
          disabled={isLoading}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
          ) : isMobile ? (
            <Smartphone className="h-4 w-4 mr-2" />
          ) : (
            <Wallet className="h-4 w-4 mr-2" />
          )}
          {isLoading ? 'Connecting...' : isMobile && !hasMetaMask ? 'Connect via MetaMask App' : 'Connect Wallet'}
        </Button>


      </div>

      <ConnectionStatus
        isConnected={isConnected}
        isLoading={isLoading}
        isMobile={isMobile}
        address={address}
      />
    </>
  );
}