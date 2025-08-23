"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, ExternalLink } from 'lucide-react';
import { connectWallet, SOMNIA_TESTNET } from '@/lib/web3';

export default function WalletConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

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
      const account = await connectWallet();
      setIsConnected(true);
      setAddress(account);
    } catch (error) {
      console.error('Connection failed:', error);
      alert('Failed to connect wallet. Please make sure MetaMask is installed.');
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
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={handleConnect}
        disabled={isLoading}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
        ) : (
          <Wallet className="h-4 w-4 mr-2" />
        )}
        {isLoading ? 'Connecting...' : 'Connect Wallet'}
      </Button>
      
      {typeof window !== 'undefined' && !window.ethereum && (
        <Button
          variant="outline"
          size="sm"
          className="border-orange-400 text-orange-300 hover:bg-orange-900/50"
          onClick={() => window.open('https://metamask.io/download/', '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          Get MetaMask
        </Button>
      )}
    </div>
  );
}