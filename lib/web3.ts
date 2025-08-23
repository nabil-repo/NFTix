// Web3 utilities for Somnia testnet integration
import { ethers } from 'ethers';
import { SOMNIA_TESTNET_CONFIG } from './contracts';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const SOMNIA_TESTNET = {
  chainId: '0x7A309', // 501001 in hex
  chainName: 'Somnia Testnet',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://dream-rpc.somnia.network'],
  blockExplorerUrls: ['https://somnia-testnet-explorer.vercel.app'],
};

export const connectWallet = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    // Switch to Somnia testnet
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SOMNIA_TESTNET.chainId }],
      });
    } catch (switchError: any) {
      // Chain doesn't exist, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [SOMNIA_TESTNET],
        });
      } else {
        throw switchError;
      }
    }

    return accounts[0];
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    throw error;
  }
};

// Get current wallet address
export const getCurrentAccount = async () => {
  if (typeof window.ethereum === 'undefined') {
    return null;
  }
  
  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    });
    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Failed to get current account:', error);
    return null;
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
    return chainId === SOMNIA_TESTNET.chainId;
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

// Sample NFT metadata structure
export const createTicketMetadata = (eventData: any) => {
  return {
    name: `${eventData.title} - NFT Ticket`,
    description: `Official NFT ticket for ${eventData.title} on ${eventData.date}`,
    image: eventData.image || 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg',
    attributes: [
      {
        trait_type: 'Event',
        value: eventData.title,
      },
      {
        trait_type: 'Date',
        value: eventData.date,
      },
      {
        trait_type: 'Location',
        value: eventData.location,
      },
      {
        trait_type: 'Category',
        value: eventData.category,
      },
      {
        trait_type: 'Seat',
        value: 'General Admission',
      },
      {
        trait_type: 'Ticket Number',
        value: `#${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      },
    ],
    external_url: 'https://nfticket.com',
  };
};

// Anti-scalping mechanisms
export const ANTI_SCALPING_RULES = {
  maxResalePrice: 1.1, // 110% of original price
  royaltyPercentage: 5, // 5% royalty to original creator
  transferCooldown: 24 * 60 * 60, // 24 hours in seconds
  verifiedSellersOnly: true,
};

export const validateResalePrice = (originalPrice: number, resalePrice: number) => {
  const maxAllowed = originalPrice * ANTI_SCALPING_RULES.maxResalePrice;
  return resalePrice <= maxAllowed;
};