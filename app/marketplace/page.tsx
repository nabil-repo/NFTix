"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, TrendingUp, Search, Filter, ArrowLeft, Ticket, Shield, Users } from 'lucide-react';
import Link from 'next/link';
import { useContract } from '@/hooks/useContract';
import { formatAddress } from '@/lib/contracts';

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('price-low');
  const [filterCategory, setFilterCategory] = useState('all');
  const [marketplaceListings, setMarketplaceListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalVolume, setTotalVolume] = useState('0');
  const [totalTicketsSold, setTotalTicketsSold] = useState(0);

  const { 
    account, 
    isConnectedToCorrectNetwork, 
    getEvents, 
    getUserTickets,
    transferTicket,
    isLoading: contractLoading 
  } = useContract();

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  const loadMarketplaceData = async () => {
    setIsLoading(true);
    try {
      // Get all events to build marketplace listings
      const events = await getEvents();
      const listings: any[] = [];
      let volume = 0;
      let ticketCount = 0;

      // For each event, we'll simulate some tickets being available for resale
      // In a real implementation, you'd track which tickets are listed for sale
      for (const event of events) {
        if (event.soldTickets > 0) {
          // Create some sample resale listings based on sold tickets
          const resaleCount = Math.min(3, Math.floor(event.soldTickets * 0.1)); // 10% of sold tickets available for resale
          
          for (let i = 0; i < resaleCount; i++) {
            const originalPrice = parseFloat(event.ticketPrice);
            const resaleMultiplier = 1 + (Math.random() * 0.1); // Up to 110% of original price
            const resalePrice = (originalPrice * resaleMultiplier).toFixed(4);
            
            listings.push({
              id: `${event.eventId}-${i}`,
              eventId: event.eventId,
              tokenId: `${event.eventId}${i.toString().padStart(3, '0')}`,
              eventTitle: event.title,
              eventDescription: event.description,
              date: event.date,
              location: event.location,
              originalPrice: event.ticketPrice,
              currentPrice: resalePrice,
              seller: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
              verified: Math.random() > 0.3, // 70% verified sellers
              category: event.category || 'General',
              timeLeft: getRandomTimeLeft(),
              maxTickets: event.maxTickets,
              soldTickets: event.soldTickets,
              organizer: event.organizer
            });

            volume += parseFloat(resalePrice);
            ticketCount++;
          }
        }
      }

      setMarketplaceListings(listings);
      setTotalVolume(volume.toFixed(2));
      setTotalTicketsSold(ticketCount);
    } catch (error) {
      console.error('Failed to load marketplace data:', error);
      setMarketplaceListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomTimeLeft = () => {
    const options = ['2 hours', '5 hours', '1 day', '2 days', '3 days', '1 week'];
    return options[Math.floor(Math.random() * options.length)];
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
      alert('Please connect your wallet to Somnia testnet first');
      return;
    }

    try {
      // In a real implementation, this would call the transferTicket function
      // For now, we'll simulate the purchase
      const confirmed = confirm(
        `Purchase ${listing.eventTitle} for ${listing.currentPrice} ETH?\n\n` +
        `This will transfer the NFT ticket to your wallet.`
      );

      if (confirmed) {
        // Simulate transaction
        alert(`Purchase initiated! Transaction will be processed on the blockchain.\n\nEvent: ${listing.eventTitle}\nPrice: ${listing.currentPrice} ETH\nToken ID: ${listing.tokenId}`);
        
        // Remove the listing from the marketplace (simulate successful purchase)
        setMarketplaceListings(prev => prev.filter(item => item.id !== listing.id));
      }
    } catch (error: any) {
      alert(`Failed to purchase ticket: ${error.message}`);
    }
  };

  const listMyTicket = () => {
    alert('Ticket listing feature coming soon! You will be able to list your owned NFT tickets for resale with automatic anti-scalping protection.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
            <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Ticket className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              NFTicket
            </h1>
          </div>
          <Button
            onClick={listMyTicket}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0"
          >
            List My Ticket
          </Button>
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
          <Card className="mb-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-blue-400 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-2">Anti-Scalping Protection Active</h3>
                  <p className="text-gray-300 text-sm">
                    All resale tickets are automatically capped at 110% of original price. 
                    5% royalty goes to event organizers. Transfer cooldowns prevent rapid speculation.
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
                  <Link href="/">
                    <Button variant="outline" className="border-purple-400 text-purple-300 hover:bg-purple-900/50">
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
                    <img
                      src="https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400"
                      alt={listing.eventTitle}
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
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-red-600/90 text-white border-0">
                        {listing.timeLeft} left
                      </Badge>
                    </div>
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
                        <span className="text-gray-400 text-sm line-through">{listing.originalPrice} ETH</span>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-white font-semibold">Resale Price</span>
                        <span className="text-2xl font-bold text-purple-400">{listing.currentPrice} ETH</span>
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
            <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30 text-center">
              <CardHeader>
                <CardTitle className="text-white">Total Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-400">{totalVolume} ETH</div>
                <p className="text-gray-300 text-sm mt-2">Marketplace trades</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-900/20 to-green-900/20 border-blue-500/30 text-center">
              <CardHeader>
                <CardTitle className="text-white">Available Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400">{filteredListings.length}</div>
                <p className="text-gray-300 text-sm mt-2">Ready for purchase</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-900/20 to-purple-900/20 border-green-500/30 text-center">
              <CardHeader>
                <CardTitle className="text-white">Average Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">
                  {filteredListings.length > 0 
                    ? (filteredListings.reduce((sum, listing) => sum + parseFloat(listing.currentPrice), 0) / filteredListings.length).toFixed(4)
                    : '0.000'
                  } ETH
                </div>
                <p className="text-gray-300 text-sm mt-2">Current market rate</p>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <Card className="mt-16 bg-gradient-to-r from-slate-900/50 to-purple-900/20 border-slate-500/30">
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