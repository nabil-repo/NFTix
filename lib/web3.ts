// Web3 utilities for Somnia testnet integration
import { ethers } from 'ethers';
declare global {
  interface Window {
    ethereum?: any;
  }
}

export const SOMNIA_TESTNET = {
  chainId: "0xc488",               // 50312 in hexadecimal
  chainName: 'Somnia Testnet',
  nativeCurrency: {
    name: 'Somnia Testnet',        // Friendly display name (optional)
    symbol: 'STT',                 // Must match official network token
    decimals: 18,
  },
  rpcUrls: ['https://dream-rpc.somnia.network'],
  blockExplorerUrls: ['https://shannon-explorer.somnia.network/'],
};


export const connectWallet = async () => {
  // Check for MetaMask on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  if (typeof window.ethereum === 'undefined') {
    if (isMobile) {
      throw new Error('Please install MetaMask mobile app or use MetaMask browser');
    }
    throw new Error('MetaMask is not installed');
  }

  try {
    // For mobile, ensure we're using the correct provider
    let provider = window.ethereum;

    // If multiple wallets are available, try to select MetaMask
    if (window.ethereum.providers?.length > 0) {
      provider = window.ethereum.providers.find((p: any) => p.isMetaMask) || window.ethereum;
    }

    // Verify provider is available
    if (!provider) {
      throw new Error('MetaMask provider not found');
    }

    // Request account access
    const accounts = await provider.request({
      method: 'eth_requestAccounts',
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock MetaMask.');
    }

    // Switch to Somnia testnet
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SOMNIA_TESTNET.chainId }],
      });
    } catch (switchError: any) {
      // Chain doesn't exist, add it
      if (switchError.code === 4902) {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [SOMNIA_TESTNET],
        });
      } else {
        throw switchError;
      }
    }

    // Verify network connection
    const chainId = await provider.request({
      method: 'eth_chainId',
    });

    if (chainId !== SOMNIA_TESTNET.chainId) {
      throw new Error('Failed to switch to Somnia Testnet');
    }

    console.log('✅ Successfully connected to wallet:', accounts[0]);
    console.log('✅ Connected to Somnia Testnet (Chain ID:', chainId, ')');

    return accounts[0];
  } catch (error: any) {
    console.error('Failed to connect wallet:', error);

    // Provide more specific error messages for common issues
    if (error.code === 4001) {
      throw new Error('Connection rejected by user');
    } else if (error.code === -32002) {
      throw new Error('Connection request already pending. Please check MetaMask.');
    } else if (error.message?.includes('network')) {
      throw new Error('Network connection failed. Please check your connection.');
    }

    throw error;
  }
};

// Get current wallet address
export const getCurrentAccount = async () => {
  if (typeof window.ethereum === 'undefined') {
    return null;
  }

  try {
    // Get the correct provider (handle multiple wallets)
    let provider = window.ethereum;
    if (window.ethereum.providers?.length > 0) {
      provider = window.ethereum.providers.find((p: any) => p.isMetaMask) || window.ethereum;
    }

    const accounts = await provider.request({
      method: 'eth_accounts',
    });
    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Failed to get current account:', error);
    return null;
  }
};

// Check wallet connection status
export const checkWalletConnection = async () => {
  try {
    const account = await getCurrentAccount();
    const isCorrectNetwork = await isConnectedToSomnia();

    return {
      isConnected: !!account,
      account,
      isCorrectNetwork,
      needsNetworkSwitch: !!account && !isCorrectNetwork
    };
  } catch (error) {
    console.error('Failed to check wallet connection:', error);
    return {
      isConnected: false,
      account: null,
      isCorrectNetwork: false,
      needsNetworkSwitch: false
    };
  }
};

// Check if connected to correct network
export const isConnectedToSomnia = async () => {
  if (typeof window.ethereum === 'undefined') {
    return false;
  }

  try {
    const chainId = await window.ethereum.request({
      method: 'eth_chainId',
    });
    return chainId == SOMNIA_TESTNET.chainId;
  } catch (error) {
    console.error('Failed to check network:', error);
    return false;
  }
};

// Get wallet balance
export const getWalletBalance = async (address: string) => {
  try {
    const provider = new ethers.JsonRpcProvider('https://dream-rpc.somnia.network');
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Failed to get wallet balance:', error);
    return '0';
  }
};



// Mobile MetaMask utilities
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const isMetaMaskMobileBrowser = () => {
  const userAgent = navigator.userAgent || navigator.vendor;
  return userAgent.includes('MetaMaskMobile');
};

export const generateMetaMaskDeepLink = (dappUrl?: string) => {
  const baseUrl = dappUrl || window.location.origin;
  const cleanUrl = baseUrl.replace(/^https?:\/\//, '');

  // MetaMask mobile deep link
  return `https://metamask.app.link/dapp/${cleanUrl}`;
};

export const getMetaMaskDownloadLink = () => {
  const userAgent = navigator.userAgent;

  if (/Android/i.test(userAgent)) {
    return 'https://play.google.com/store/apps/details?id=io.metamask';
  } else if (/iPad|iPhone|iPod/.test(userAgent)) {
    return 'https://apps.apple.com/us/app/metamask/id1438144202';
  } else {
    return 'https://metamask.io/download/';
  }
};

export const connectMobileWallet = async () => {
  if (isMetaMaskMobileBrowser()) {
    // Already in MetaMask browser, use standard connection
    console.log('📱 Connecting via MetaMask mobile browser...');
    return connectWallet();
  }

  if (!window.ethereum && isMobileDevice()) {
    // Check if this is Android specifically
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isAndroid) {
      console.log('📱 Android device detected, attempting MetaMask app connection...');

      // Try to open MetaMask app with deep link
      const deepLink = generateMetaMaskDeepLink();

      // Use intent URL for better Android integration
      const intentUrl = `intent://${window.location.hostname}${window.location.pathname}#Intent;scheme=https;package=io.metamask;end`;

      try {
        // First try the intent URL (works better on Android)
        window.location.href = intentUrl;

        // Fallback to universal deep link after a delay
        setTimeout(() => {
          window.location.href = deepLink;
        }, 1000);

        throw new Error('Redirecting to MetaMask app...');
      } catch (error) {
        // If deep link fails, redirect to Play Store
        window.location.href = 'https://play.google.com/store/apps/details?id=io.metamask';
        throw new Error('Please install MetaMask from Google Play Store');
      }
    } else {
      // iOS or other mobile device
      const deepLink = generateMetaMaskDeepLink();
      window.location.href = deepLink;
      throw new Error('Redirecting to MetaMask app...');
    }
  }

  return connectWallet();
};