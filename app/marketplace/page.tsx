"use client";

import { useState, useEffect, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, TrendingUp, Search, Filter, ArrowLeft, Ticket, Shield, Users } from 'lucide-react';
import Link from 'next/link';
import { useContract } from '@/hooks/useContract';
import { formatAddress } from '@/lib/contracts';
import { contractService } from '@/lib/contracts';
import ListMyTicket from '@/components/ui/listMyTicket';
import AlertDialog from '@/components/alert-dialog';
import Image from 'next/image';


export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('price-low');
  const [filterCategory, setFilterCategory] = useState('all');
  const [marketplaceListings, setMarketplaceListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalVolume, setTotalVolume] = useState('0');
  const [totalTicketsSold, setTotalTicketsSold] = useState(0);
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [DialogTitle, setDialogTitle] = useState('');

  const {
    account,
    isConnectedToCorrectNetwork,
    getEvents,
    getTicketsByOwner,
    getTicket,
    isLoading: contractLoading,
    getAllListings,
    getEvent,
  } = useContract();


  useEffect(() => {
    if (account) {

      loadMarketplaceData();
      loadUserTickets();
    }
  }, [account]);

  const loadUserTickets = async () => {
    //  console.log("loading user tickets for", account);
    if (!account) return;

    try {
      // 1. Get all ticket IDs owned by the user.
      const ticketIds = await getTicketsByOwner(account);

      // 2. Create an array of promises to fetch details for each ticket AND its event in parallel.
      const ticketDetailPromises = ticketIds.map(async (tokenId) => {
        try {
          // We assume getTicketsByOwner returns an array of BigInts/numbers
          const ticket = await getTicket(tokenId.tokenId);
          // Use the CORRECT ID (ticket.eventId) to fetch the event
          const event = await getEvent(ticket.eventId);

          // Return a single, combined object with all necessary data
          return {
            id: ticket.tokenId.toString(),
            isUsed: ticket.isUsed,
            originalPrice: ticket.originalPrice?.toString(),
            event: {
              title: event.title,
              date: event.date,
              location: event.location
            }
          };
        } catch (err) {
          console.error(`Failed to fetch details for ticket #${tokenId}`, err);
          return null; // Return null for failed fetches
        }
      });

      // 3. Wait for all parallel requests to complete.
      const allTickets = await Promise.all(ticketDetailPromises);

      // 4. Use a Map to easily handle deduplication and filter out any nulls from failed fetches.
      const uniqueTickets = new Map();
      allTickets.forEach(ticket => {
        if (ticket) { // Ensure ticket is not null
          uniqueTickets.set(ticket.id, ticket);
        }
      });

      const ticketsArray = Array.from(uniqueTickets.values());

      // 5. Now, perform a simple, SYNCHRONOUS filter on the complete data.

      const now = new Date();

      const nonExpiredTickets = ticketsArray.filter(ticket => {
        const eventDate = new Date(ticket.event.date);

        const isUpcoming = eventDate.getTime() > now.getTime();

        //console.log(
        //  `Ticket #${ticket.id} - isUsed: ${ticket.isUsed}, event date: ${eventDate}, upcoming: ${isUpcoming}`
        //);

        return !ticket.isUsed && isUpcoming;
      });


      //console.log("user tickets", nonExpiredTickets);
      setUserTickets(nonExpiredTickets);

    } catch (err) {
      console.error("Failed to fetch user tickets", err);
    }
  };

  function getEventImage(event: any): string {
    if (event && event.metadataURI) {
      if (typeof event.metadataURI === 'string' && event.metadataURI.startsWith('data:application/json;base64,')) {
        try {
          const base64 = event.metadataURI.replace('data:application/json;base64,', '');
          const json = JSON.parse(typeof atob !== 'undefined' ? atob(base64) : Buffer.from(base64, 'base64').toString('utf-8'));
          return json.image || '';
        } catch (err) {
          return '';
        }
      }
      if (typeof event.metadataURI === 'object' && event.metadataURI.image) {
        return event.metadataURI.image;
      }
    }
    return '';
  }

  const loadMarketplaceData = async () => {
    setIsLoading(true);
    try {
      //const events = await getEvents(0, 10);
      const listings: any[] = [];

      const ticketIds = await getAllListings(); // or query indexed events
      //console.log("all listings", ticketIds[0]);

      for (const tokenId of ticketIds) {
        if (tokenId === null) continue; // skip invalid tokenId
        const ticket = await getTicket(tokenId.tokenId);
        const event = await getEvent(ticket.eventId);

        listings.push({
          id: `${ticket.tokenId}`,
          eventId: ticket.eventId,
          tokenId: ticket.tokenId,
          eventTitle: event.title,
          eventDescription: event.description,
          date: event.date,
          location: event.location,
          originalPrice: event.ticketPrice,
          currentPrice: tokenId.price, // resale listing price logic
          seller: ticket.owner,
          // verified: verifiedOrganizers[event.organizer],
          timeLeft: "—", // you can calculate based on event.date
          maxTickets: event.maxTickets,
          soldTickets: event.soldTickets,
          organizer: event.organizer,
          image: getEventImage(event),
        });
      }

      setMarketplaceListings(listings);
      setTotalTicketsSold(listings.length);
      const volume = listings.reduce((sum, listing) => sum + parseFloat(listing.currentPrice), 0);
      setTotalVolume(volume.toFixed(4));

    } catch (error) {
      console.error('Failed to load marketplace data:', error);
      setMarketplaceListings([]);
    } finally {
      setIsLoading(false);
    }
  };



  const filteredListings = marketplaceListings
    .filter(listing => {
      const matchesSearch = listing.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || listing.category.toLowerCase() === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.currentPrice) - parseFloat(b.currentPrice);
        case 'price-high':
          return parseFloat(b.currentPrice) - parseFloat(a.currentPrice);
        case 'time-left':
          return a.timeLeft.localeCompare(b.timeLeft);
        case 'event-date':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        default:
          return 0;
      }
    });

  const buyTicket = async (listing: any) => {
    if (!account || !isConnectedToCorrectNetwork) {
      setDialogTitle('Please connect your wallet to Somnia testnet first');
      setDialogOpen(true);
      return;
    }

    try {
      const tx = await contractService.buyTicket(listing.tokenId, listing.currentPrice);
      setDialogTitle('Ticket purchased successfully! Tx: ' + tx.txHash);
      setDialogOpen(true);
      await loadMarketplaceData(); // reload marketplace after purchase
    } catch (error: any) {
      console.error('Failed to buy ticket:', error);
      setDialogTitle('Transaction failed' + (error.message ? ': ' + error.message : ''));
      setDialogOpen(true);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AlertDialog onCancel={() => { setDialogOpen(false) }} onConfirm={() => { setDialogOpen(false); }} open={dialogOpen} title={DialogTitle} />
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-lg bg-black/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 text-white hover:text-purple-300 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Events</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            {/* <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Ticket className="h-4 w-4 text-white" />
            </div> */}
            <Image src="/icon2.png" width={30} height={30} alt="NFTix Logo" />

            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              NFTix
            </h1>
          </div>

          <ListMyTicket
            userTickets={userTickets}
            onListTicket={async (ticketId, price) => {
              try {
                const tx = await contractService.listTicket(ticketId, price);
                setDialogTitle('Ticket Listed Successfully! Tx: ' + tx.txHash);
                setDialogOpen(true);
                await loadMarketplaceData();
              } catch (error: any) {
                setDialogTitle('Transaction Failed' + (error.message ? ': ' + error.message : ''));
                setDialogOpen(true);
              }
            }}
          />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Ticket Marketplace</h1>
            <p className="text-gray-300 text-lg">
              Buy and sell verified NFT tickets securely on the blockchain
            </p>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search events or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>

            <Select onValueChange={setFilterCategory} defaultValue="all">
              <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-white">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="conference">Conference</SelectItem>
                <SelectItem value="art">Art</SelectItem>
                <SelectItem value="gaming">Gaming</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="theater">Theater</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={setSortBy} defaultValue="price-low">
              <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-white">
                <TrendingUp className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="event-date">Event Date</SelectItem>
                <SelectItem value="time-left">Time Left</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Anti-Scalping Notice */}
          <Card className="mb-8 bg-gradient-to-r from-blue-900 to-purple-900 border-blue-500">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-blue-400 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-2">Anti-Scalping Protection Active</h3>
                  <p className="text-gray-300 text-sm">
                    All resale tickets are automatically capped at 110% of original price.
                    5% royalty goes to event organizers. Transfer cooldown period (24 hours) prevent rapid speculation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-400 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-300">Loading marketplace from blockchain...</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm text-center py-12">
              <CardContent>
                <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-4">
                  {marketplaceListings.length === 0
                    ? 'No tickets available for resale yet'
                    : 'No tickets match your search'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterCategory('all');
                    }}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
                  >
                    Clear Filters
                  </Button>
                  <Link href="/#events">
                    <Button variant="outline" className="border-purple-500 text-purple-800 hover:bg-purple-200">
                      Browse Events
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map((listing) => (
                <Card key={listing.id} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 overflow-hidden group">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={listing.image}
                      alt={listing.eventTitle}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 flex flex-col space-y-2">
                      <Badge className="bg-purple-600/90 text-white border-0">
                        {listing.category}
                      </Badge>
                      {listing.verified && (
                        <Badge className="bg-green-600/90 text-white border-0">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    {/* <div className="absolute top-4 left-4">
                      <Badge className="bg-red-600/90 text-white border-0">
                        {listing.timeLeft} left
                      </Badge>
                    </div> */}
                    <div className="absolute bottom-4 left-4">
                      <Badge className="bg-blue-600/90 text-white border-0 font-mono">
                        #{listing.tokenId}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-white text-lg line-clamp-2">
                      {listing.eventTitle}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center text-gray-300 text-sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      {listing.date.toLocaleDateString()} at {listing.date.toLocaleTimeString()}
                    </div>

                    <div className="flex items-center text-gray-300 text-sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      {listing.location}
                    </div>

                    <div className="flex items-center text-gray-300 text-sm">
                      <Users className="h-4 w-4 mr-2" />
                      {listing.soldTickets}/{listing.maxTickets} sold
                    </div>

                    <div className="border-t border-white/10 pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">Original Price</span>
                        <span className="text-gray-400 text-sm line-through">{listing.originalPrice} STT</span>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-white font-semibold">Resale Price</span>
                        <span className="text-2xl font-bold text-purple-400">{listing.currentPrice} STT</span>
                      </div>

                      <div className="text-xs text-gray-400 mb-4 font-mono">
                        <div>Seller: {listing.seller}</div>
                        <div>Organizer: {formatAddress(listing.organizer)}</div>
                      </div>

                      <Button
                        onClick={() => buyTicket(listing)}
                        disabled={!account || !isConnectedToCorrectNetwork}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 disabled:opacity-50"
                      >
                        {!account ? 'Connect Wallet' : 'Buy Now'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Trading Stats */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-r from-purple-900 to-blue-900 border-purple-500 text-center">
              <CardHeader>
                <CardTitle className="text-white">Total Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-400">{totalVolume} STT</div>
                <p className="text-gray-300 text-sm mt-2">Marketplace trades</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-900 to-green-900 border-blue-500 text-center">
              <CardHeader>
                <CardTitle className="text-white">Available Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400">{filteredListings.length}</div>
                <p className="text-gray-300 text-sm mt-2">Ready for purchase</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-900 to-purple-900 border-green-500 text-center">
              <CardHeader>
                <CardTitle className="text-white">Average Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">
                  {filteredListings.length > 0
                    ? (filteredListings.reduce((sum, listing) => sum + parseFloat(listing.currentPrice), 0) / filteredListings.length).toFixed(4)
                    : '0.000'
                  } STT
                </div>
                <p className="text-gray-300 text-sm mt-2">Current market rate</p>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <Card className="mt-16 bg-gradient-to-r from-slate-900 to-purple-900 border-slate-500">
            <CardHeader>
              <CardTitle className="text-white text-center">How Marketplace Works</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">Anti-Scalping Protection</h3>
                <p className="text-gray-300 text-sm">
                  Smart contracts automatically enforce maximum resale prices and transfer cooldowns
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">Fair Royalties</h3>
                <p className="text-gray-300 text-sm">
                  5% of every resale goes back to the original event organizer automatically
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ticket className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">Verified Ownership</h3>
                <p className="text-gray-300 text-sm">
                  Blockchain verification ensures all tickets are authentic and transferable
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>

  );
}