
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

export const NFT_TICKET_ABI = [
  // --- Events ---
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
  "event EventCreated(uint256 indexed eventId, address indexed organizer, string title)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
  "event TicketBought(uint256 indexed tokenId, address indexed buyer, uint256 price)",
  "event TicketListed(uint256 indexed tokenId, address indexed seller, uint256 price)",
  "event TicketMinted(uint256 indexed tokenId, uint256 indexed eventId, address indexed buyer)",
  "event TicketUnlisted(uint256 indexed tokenId, address indexed seller)",
  "event TicketUsed(uint256 indexed tokenId, uint256 indexed eventId)",
  "event TicketTransferred(uint256 indexed tokenId, address indexed from, address indexed to, uint256 price)", // ✅ added
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",

  // --- Read Functions ---
  "function MAX_RESALE_PERCENTAGE() view returns (uint256)",
  "function ROYALTY_PERCENTAGE() view returns (uint256)",
  "function TRANSFER_COOLDOWN() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function events(uint256) view returns (uint256 eventId, string title, string description, string location, uint256 date, uint256 ticketPrice, uint256 maxTickets, uint256 soldTickets, address organizer, bool isActive, string metadataURI)",
  "function fetchEvent(uint256 _eventId) view returns (tuple(uint256 eventId, string title, string description, string location, uint256 date, uint256 ticketPrice, uint256 maxTickets, uint256 soldTickets, address organizer, bool isActive, string metadataURI))",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function getEventsByOrganizer(address _organizer) view returns (uint256[])",
  "function getTicket(uint256 _tokenId) view returns (tuple(uint256 tokenId, uint256 eventId, address owner, bool isUsed, uint256 purchaseTime, uint256 originalPrice))",
  "function getTicketsByOwner(address _owner) view returns (uint256[])",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function lastTransferTime(uint256) view returns (uint256)",
  "function listings(uint256) view returns (uint256 tokenId, address seller, uint256 price, bool active)",
  "function name() view returns (string)",
  "function owner() view returns (address)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function supportsInterface(bytes4 interfaceId) view returns (bool)",
  "function symbol() view returns (string)",
  "function tickets(uint256) view returns (uint256 tokenId, uint256 eventId, address owner, bool isUsed, uint256 purchaseTime, uint256 originalPrice)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function verifiedOrganizers(address) view returns (bool)",

  // --- Write Functions ---
  "function approve(address to, uint256 tokenId)",
  "function buyTicket(uint256 _tokenId) payable",
  "function cancelListing(uint256 _tokenId)",
  "function createEvent(string _title, string _description, string _location, uint256 _date, uint256 _ticketPrice, uint256 _maxTickets, string _metadataURI) returns (uint256)",
  "function deactivateEvent(uint256 _eventId)",
  "function listTicket(uint256 _tokenId, uint256 _price)",
  "function mintTicket(uint256 _eventId, string _tokenURI) payable returns (uint256)",
  "function renounceOwnership()",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)",
  "function setApprovalForAll(address operator, bool approved)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function transferOwnership(address newOwner)",
  "function useTicket(uint256 _tokenId)",
  "function verifyOrganizer(address _organizer)",
  "function withdraw()"
];

// Contract address (will be set after deployment)
export const NFT_TICKET_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x1ded6Fb69011cd3b82C7e6218d24E12f083e967F';

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

function formatTimeLeft(seconds: bigint) {
  const sec = Number(seconds);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// Contract interaction functions
export const contractService = {
  // ...existing code...

  // Deactivate (cancel) an event
  async deactivateEvent(eventId: string) {
    if (!eventId) {
      throw new Error('Event ID is required');
    }
    const contract = await getContract(true);
    const tx = await contract.deactivateEvent(eventId);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  },
  // Create a new event
  async createEvent(eventData: {
    title: string;
    description: string;
    location: string;
    date: Date;
    ticketPrice: string; // in STT
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

    console.log("contract:- ", await contract.getAddress());

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
    const event = await contract.fetchEvent(eventId);

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
  // List a ticket for resale
  async listTicket(tokenId: string, price: string) {
    if (!tokenId || !price) {
      throw new Error('Missing required parameters for ticket listing');
    }

    const contract = await getContract(true);

    let TRANSFER_COOLDOWN = await contract.TRANSFER_COOLDOWN();
    let lastTransferTime = await contract.lastTransferTime(tokenId);

    console.log('Last transfer time:', lastTransferTime);
    console.log('Current time:', Date.now());

    const now = BigInt(Math.floor(Date.now() / 1000));
    const timeLeft = lastTransferTime + TRANSFER_COOLDOWN - now;


    if (lastTransferTime + TRANSFER_COOLDOWN > now) {
      throw new Error('Transfer cooldown in effect , time left: ' + formatTimeLeft(timeLeft));
    }


    const priceInWei = ethers.parseEther(price);

    const tx = await contract.listTicket(tokenId, priceInWei);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  },

  // Cancel a ticket listing
  async cancelListing(tokenId: string) {
    if (!tokenId) {
      throw new Error('Token ID is required');
    }

    const contract = await getContract(true);
    const tx = await contract.cancelListing(tokenId);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  },

  // Buy a listed ticket
  async buyTicket(tokenId: string, price: string) {
    if (!tokenId || !price) {
      throw new Error('Missing required parameters for buying ticket');
    }

    const contract = await getContract(true);


    const priceInWei = ethers.parseEther(price);

    const tx = await contract.buyTicket(tokenId, { value: priceInWei });
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  },

  // Verify a ticket's validity
  async verifyTicket(tokenId: string): Promise<{ ticket: TicketData; event: EventData; isValid: boolean; message: string }> {
    if (!tokenId) {
      throw new Error('Token ID is required');
    }

    try {
      const ticket = await this.getTicket(tokenId);
      const event = await this.getEvent(ticket.eventId);

      const now = new Date();
      let isValid = true;
      let message = 'Ticket is valid.';

      if (ticket.isUsed) {
        isValid = false;
        message = 'This ticket has already been used.';
      } else if (now > event.date) {
        isValid = false;
        message = 'This ticket is for an event that has already ended.';
      } else if (!event.isActive) {
        isValid = false;
        message = 'This ticket is for an event that has been cancelled.';
      }

      return { ticket, event, isValid, message };
    } catch (error) {
      // If the ticket or event doesn't exist, the contract calls will throw an error.
      // We catch it and return a clear "invalid" status.
      return {
        ticket: {} as TicketData,
        event: {} as EventData,
        isValid: false,
        message: 'This ticket is invalid or does not exist.',
      };
    }
  },

  // Get all active events (for marketplace/discovery)
  async getAllActiveEvents(from: number, to: number): Promise<EventData[]> {
    const contract = await getContract();

    const events = [];
    let eventId = from;
    const eventCount = to;
    try {
      while (true) {
        try {
          const event = await this.getEvent(eventId.toString());
          if (event.isActive) {
            events.push(event);
          }
          eventId++;

          // Safety break to prevent infinite loops
          if (eventId > eventCount) {
            console.warn('Reached maximum event ID limit', eventCount);
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
  },
  // Get all listings (for marketplace)
  async listings(): Promise<{
    tokenId: string; seller: string; price: string;
    active: boolean;
  }[]> {
    const contract = await getContract();

    const listings = [];
    let tokenId = 1;
    const maxTokenId = 10 // Arbitrary
    try {
      while (true) {
        try {
          const listing = await contract.listings(tokenId);
          if (listing.active) {
            listings.push({
              tokenId: listing.tokenId.toString(),
              seller: listing.seller,
              price: ethers.formatEther(listing.price),
              active: listing.active
            });
          }
          tokenId++;
          // Safety break to prevent infinite loops
          if (tokenId > maxTokenId) {
            console.warn('Reached maximum token ID limit', maxTokenId);
            break;
          }
        } catch (error) {
          // No more listings
          break;
        }
      }
    } catch (error) {
      console.log('Finished loading listings');
    }
    return listings;
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
    return '0.0000 STT';
  }
  return `${parseFloat(priceInEth).toFixed(4)} STT`;
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