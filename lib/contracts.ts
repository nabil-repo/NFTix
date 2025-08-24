 // Smart contract integration utilities
import { ethers } from 'ethers';

// Types for better type safety
export interface EventData {
  eventId: string;
  title: string;
  description: string;
  location: string;
  date: Date;
  ticketPrice: string;
  maxTickets: number;
  soldTickets: number;
  organizer: string;
  isActive: boolean;
  metadataURI: string;
}

export interface TicketData {
  tokenId: string;
  eventId: string;
  owner: string;
  isUsed: boolean;
  purchaseTime: Date;
  originalPrice: string;
}


// Contract ABI (Application Binary Interface)
export const NFT_TICKET_ABI = [
  // Events
  "event EventCreated(uint256 indexed eventId, address indexed organizer, string title)",
  "event TicketMinted(uint256 indexed tokenId, uint256 indexed eventId, address indexed buyer)",
  "event TicketUsed(uint256 indexed tokenId, uint256 indexed eventId)",
  "event TicketTransferred(uint256 indexed tokenId, address indexed from, address indexed to, uint256 price)",

  // Read functions
  "function events(uint256) view returns (uint256 eventId, string title, string description, string location, uint256 date, uint256 ticketPrice, uint256 maxTickets, uint256 soldTickets, address organizer, bool isActive, string metadataURI)",
  "function tickets(uint256) view returns (uint256 tokenId, uint256 eventId, address owner, bool isUsed, uint256 purchaseTime, uint256 originalPrice)",
  "function getEvent(uint256 eventId) view returns (tuple(uint256 eventId, string title, string description, string location, uint256 date, uint256 ticketPrice, uint256 maxTickets, uint256 soldTickets, address organizer, bool isActive, string metadataURI))",
  "function getTicket(uint256 tokenId) view returns (tuple(uint256 tokenId, uint256 eventId, address owner, bool isUsed, uint256 purchaseTime, uint256 originalPrice))",
  "function getEventsByOrganizer(address organizer) view returns (uint256[])",
  "function getTicketsByOwner(address owner) view returns (uint256[])",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",

  // Write functions
  "function createEvent(string title, string description, string location, uint256 date, uint256 ticketPrice, uint256 maxTickets, string metadataURI) returns (uint256)",
  "function mintTicket(uint256 eventId, string tokenURI) payable returns (uint256)",
  "function useTicket(uint256 tokenId)",
  "function transferTicket(uint256 tokenId, address to, uint256 price)",
  "function verifyOrganizer(address organizer)",
  "function deactivateEvent(uint256 eventId)"
];

// Contract address (will be set after deployment)
export const NFT_TICKET_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

// Somnia testnet configuration
export const SOMNIA_TESTNET_CONFIG = {
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


// Get provider and signer
export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  // Fallback to read-only provider
  return new ethers.JsonRpcProvider('https://dream-rpc.somnia.network');
};

export const getSigner = async () => {
  const provider = getProvider();
  if (provider instanceof ethers.BrowserProvider) {
    return await provider.getSigner();
  }
  throw new Error('No wallet connected');
};

// Get contract instance
export const getContract = async (withSigner = false) => {
  if (!NFT_TICKET_CONTRACT_ADDRESS) {
    throw new Error('Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your environment variables.');
  }

  if (withSigner) {
    const signer = await getSigner();
    return new ethers.Contract(NFT_TICKET_CONTRACT_ADDRESS, NFT_TICKET_ABI, signer);
  } else {
    const provider = getProvider();
    return new ethers.Contract(NFT_TICKET_CONTRACT_ADDRESS, NFT_TICKET_ABI, provider);
  }
};

// Contract interaction functions
export const contractService = {
  // Create a new event
  async createEvent(eventData: {
    title: string;
    description: string;
    location: string;
    date: Date;
    ticketPrice: string; // in ETH
    maxTickets: number;
    metadataURI: string;
  }) {
    if (!eventData.title || !eventData.description || !eventData.location) {
      throw new Error('Missing required event data');
    }
    
    if (eventData.date <= new Date()) {
      throw new Error('Event date must be in the future');
    }

    const contract = await getContract(true);
    const priceInWei = ethers.parseEther(eventData.ticketPrice);
    const dateTimestamp = Math.floor(eventData.date.getTime() / 1000);

    const tx = await contract.createEvent(
      eventData.title,
      eventData.description,
      eventData.location,
      dateTimestamp,
      priceInWei,
      eventData.maxTickets,
      eventData.metadataURI
    );

    const receipt = await tx.wait();

    // Extract event ID from logs
    const eventCreatedLog = receipt.logs.find((log: any) => {
      try {
        return log.topics[0] === ethers.id("EventCreated(uint256,address,string)");
      } catch {
        return false;
      }
    });

    if (eventCreatedLog) {
      const eventId = ethers.getBigInt(eventCreatedLog.topics[1]);
      return { eventId: eventId.toString(), txHash: receipt.hash };
    }

    throw new Error('Event creation failed');
  },

  // Mint a ticket for an event
  async mintTicket(eventId: string, tokenURI: string, ticketPrice: string) {
    if (!eventId || !tokenURI || !ticketPrice) {
      throw new Error('Missing required parameters for ticket minting');
    }

    const contract = await getContract(true);
    const priceInWei = ethers.parseEther(ticketPrice);

    const tx = await contract.mintTicket(eventId, tokenURI, {
      value: priceInWei
    });

    const receipt = await tx.wait();

    // Extract token ID from logs
    const ticketMintedLog = receipt.logs.find((log: any) => {
      try {
        return log.topics[0] === ethers.id("TicketMinted(uint256,uint256,address)");
      } catch {
        return false;
      }
    });

    if (ticketMintedLog) {
      const tokenId = ethers.getBigInt(ticketMintedLog.topics[1]);
      return { tokenId: tokenId.toString(), txHash: receipt.hash };
    }

    throw new Error('Ticket minting failed');
  },


  // Get event details
  async getEvent(eventId: string): Promise<EventData> {
    if (!eventId) {
      throw new Error('Event ID is required');
    }

    const contract = await getContract();
    const event = await contract.getEvent(eventId);

    return {
      eventId: event.eventId.toString(),
      title: event.title,
      description: event.description,
      location: event.location,
      date: new Date(Number(event.date) * 1000),
      ticketPrice: ethers.formatEther(event.ticketPrice),
      maxTickets: Number(event.maxTickets),
      soldTickets: Number(event.soldTickets),
      organizer: event.organizer,
      isActive: event.isActive,
      metadataURI: event.metadataURI
    };
  },

  // Get ticket details
  async getTicket(tokenId: string): Promise<TicketData> {
    if (!tokenId) {
      throw new Error('Token ID is required');
    }

    const contract = await getContract();
    const ticket = await contract.getTicket(tokenId);

    return {
      tokenId: ticket.tokenId.toString(),
      eventId: ticket.eventId.toString(),
      owner: ticket.owner,
      isUsed: ticket.isUsed,
      purchaseTime: new Date(Number(ticket.purchaseTime) * 1000),
      originalPrice: ethers.formatEther(ticket.originalPrice)
    };
  },

  // Get events by organizer
  async getEventsByOrganizer(organizerAddress: string): Promise<EventData[]> {
    if (!organizerAddress || !ethers.isAddress(organizerAddress)) {
      throw new Error('Valid organizer address is required');
    }

    const contract = await getContract();
    const eventIds = await contract.getEventsByOrganizer(organizerAddress);

    const events = await Promise.all(
      eventIds.map(async (id: bigint) => {
        return await this.getEvent(id.toString());
      })
    );

    return events;
  },

  // Get tickets by owner
  async getTicketsByOwner(ownerAddress: string): Promise<(TicketData & { event: EventData })[]> {
    if (!ownerAddress || !ethers.isAddress(ownerAddress)) {
      throw new Error('Valid owner address is required');
    }

    const contract = await getContract();
    const tokenIds = await contract.getTicketsByOwner(ownerAddress);

    const tickets = await Promise.all(
      tokenIds.map(async (id: bigint) => {
        const ticket = await this.getTicket(id.toString());
        const event = await this.getEvent(ticket.eventId);
        return { ...ticket, event };
      })
    );

    return tickets;
  },

  // Use a ticket (for event check-in)
  async useTicket(tokenId: string) {
    if (!tokenId) {
      throw new Error('Token ID is required');
    }

    const contract = await getContract(true);
    const tx = await contract.useTicket(tokenId);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  },

  // Transfer ticket in marketplace
  async transferTicket(tokenId: string, toAddress: string, price: string) {
    if (!tokenId || !toAddress || !price) {
      throw new Error('Missing required parameters for ticket transfer');
    }
    
    if (!ethers.isAddress(toAddress)) {
      throw new Error('Invalid recipient address');
    }

    const contract = await getContract(true);
    const priceInWei = ethers.parseEther(price);

    const tx = await contract.transferTicket(tokenId, toAddress, priceInWei, {
      value: priceInWei
    });

    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  },

  // Get all active events (for marketplace/discovery)
  async getAllActiveEvents(): Promise<EventData[]> {
    const contract = await getContract();

    // This is a simplified approach - in production, you'd want to use events/logs
    // or implement a more efficient querying mechanism
    const events = [];
    let eventId = 1;

    try {
      while (true) {
        try {
          const event = await this.getEvent(eventId.toString());
          if (event.isActive) {
            events.push(event);
          }
          eventId++;
          
          // Safety break to prevent infinite loops
          if (eventId > 10000) {
            console.warn('Reached maximum event ID limit (10000)');
            break;
          }
        } catch (error) {
          // No more events
          break;
        }
      }
    } catch (error) {
      console.log('Finished loading events');
    }

    return events;
  }
};

// Utility functions
export const formatAddress = (address: string) => {
  if (!address || !ethers.isAddress(address)) {
    return 'Invalid Address';
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatPrice = (priceInEth: string) => {
  if (!priceInEth || isNaN(parseFloat(priceInEth))) {
    return '0.0000 ETH';
  }
  return `${parseFloat(priceInEth).toFixed(4)} ETH`;
};

export const isEventActive = (event: EventData) => {
  return event.isActive && new Date() < event.date;
};

export const getEventStatus = (event: EventData) => {
  const now = new Date();
  const eventDate = event.date;

  if (!event.isActive) return 'cancelled';
  if (now > eventDate) return 'ended';
  if (event.soldTickets >= event.maxTickets) return 'sold-out';
  return 'active';
};