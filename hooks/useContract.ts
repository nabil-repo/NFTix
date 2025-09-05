// Custom hook for contract interactions
import { useState, useEffect, useCallback } from 'react';
import { contractService } from '@/lib/contracts';
import { getCurrentAccount, isConnectedToSomnia } from '@/lib/web3';
import { Console } from 'console';

export const useContract = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnectedToCorrectNetwork, setIsConnectedToCorrectNetwork] = useState(false);

  // Check wallet connection and network
  const checkConnection = useCallback(async () => {
    try {
      const currentAccount = await getCurrentAccount();
      const correctNetwork = await isConnectedToSomnia();

      setAccount(currentAccount);
      setIsConnectedToCorrectNetwork(correctNetwork);
    } catch (error) {
      console.error('Failed to check connection:', error);
    }
  }, []);

  useEffect(() => {
    checkConnection();

    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', checkConnection);
      window.ethereum.on('chainChanged', checkConnection);

      return () => {
        window.ethereum.removeListener('accountsChanged', checkConnection);
        window.ethereum.removeListener('chainChanged', checkConnection);
      };
    }
  }, [checkConnection]);

  // Create event
  const createEvent = useCallback(async (eventData: any) => {
    if (!account || !isConnectedToCorrectNetwork) {
      throw new Error('Please connect your wallet to Somnia testnet');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await contractService.createEvent(eventData);
      return result;
    } catch (error: any) {
      const errorMessage = error.reason || error.message || 'Failed to create event';
      setError(errorMessage);
      console.error('Create Event Error:', error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [account, isConnectedToCorrectNetwork]);

  // Mint ticket
  const mintTicket = useCallback(async (eventId: string, tokenURI: string, ticketPrice: string) => {
    if (!account || !isConnectedToCorrectNetwork) {
      throw new Error('Please connect your wallet to Somnia testnet');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await contractService.mintTicket(eventId, tokenURI, ticketPrice);
      return result;
    } catch (error: any) {
      const errorMessage = error.reason || error.message || 'Failed to mint ticket';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [account, isConnectedToCorrectNetwork]);

  const getEvent = useCallback(async (eventId: string) => {
    return await contractService.getEvent(eventId);
  }, []);

  // Get events
  const getEvents = useCallback(async (from: number, to: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const events = await contractService.getAllActiveEvents(from, to);
      return events;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load events';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get user tickets
  const getUserTickets = useCallback(async () => {
    if (!account) {
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const tickets = await contractService.getTicketsByOwner(account);
      return tickets;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load tickets';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [account]);

  // Get user events (as organizer)
  const getUserEvents = useCallback(async () => {
    if (!account) {
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const events = await contractService.getEventsByOrganizer(account);
      return events;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load user events';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [account]);

  // Use ticket
  const useTicket = useCallback(async (tokenId: string) => {
    if (!account || !isConnectedToCorrectNetwork) {
      throw new Error('Please connect your wallet to Somnia testnet');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await contractService.useTicket(tokenId);
      return result;
    } catch (error: any) {
      const errorMessage = error.reason || error.message || 'Failed to use ticket';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [account, isConnectedToCorrectNetwork]);

  // Transfer ticket
  const transferTicket = useCallback(async (tokenId: string, toAddress: string, price: string) => {
    if (!account || !isConnectedToCorrectNetwork) {
      throw new Error('Please connect your wallet to Somnia testnet');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await contractService.transferTicket(tokenId, toAddress, price);
      return result;
    } catch (error: any) {
      const errorMessage = error.reason || error.message || 'Failed to transfer ticket';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [account, isConnectedToCorrectNetwork]);

  async function getTicketsByOwner(address: string) {
    return await contractService.getTicketsByOwner(address);
  }
  async function getTicket(tokenId: string) {
    return await contractService.getTicket(tokenId);
  }
  async function getAllListings() {
    return await contractService.listings();
  }
  async function listTicket(tokenId: string, price: string) {
    if (!account || !isConnectedToCorrectNetwork) {
      throw new Error('Please connect your wallet to Somnia testnet');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await contractService.listTicket(tokenId, price);
      return result;
    } catch (error: any) {
      const errorMessage = error.reason || error.message || 'Failed to list ticket';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  async function cancelListing(tokenId: string) {
    if (!account || !isConnectedToCorrectNetwork) {
      throw new Error('Please connect your wallet to Somnia testnet');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await contractService.cancelListing(tokenId);
      return result;
    } catch (error: any) {
      const errorMessage = error.reason || error.message || 'Failed to cancel listing';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    // State
    isLoading,
    error,
    account,
    isConnectedToCorrectNetwork,

    // Actions
    createEvent,
    mintTicket,
    getEvents,
    getUserTickets,
    getUserEvents,
    useTicket,
    transferTicket,
    checkConnection,
    getTicketsByOwner,
    getTicket,
    getAllListings,
    getEvent,
    listTicket,
    cancelListing
  };
};