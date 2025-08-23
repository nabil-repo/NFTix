// Web3 utilities for Somnia testnet integration
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

export const getContract = (address: string, abi: any, provider: any) => {
  // In a real implementation, this would return an ethers.js contract instance
  return {
    address,
    abi,
    provider,
    // Mock contract methods
    mintTicket: async (to: string, tokenURI: string) => {
      console.log(`Minting ticket to ${to} with metadata ${tokenURI}`);
      return { hash: '0x123...abc' };
    },
    transferFrom: async (from: string, to: string, tokenId: string) => {
      console.log(`Transferring token ${tokenId} from ${from} to ${to}`);
      return { hash: '0x456...def' };
    },
    ownerOf: async (tokenId: string) => {
      console.log(`Getting owner of token ${tokenId}`);
      return '0x789...ghi';
    },
  };
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