"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, TrendingUp, Search, Filter, ArrowLeft, Ticket, Shield } from 'lucide-react';
import Link from 'next/link';

const marketplaceListings = [
  {
    id: 1,
    eventTitle: "BlockChain Music Festival 2025",
    eventImage: "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400",
    date: "2025-03-15",
    time: "18:00",
    location: "Crypto Arena, Los Angeles",
    originalPrice: "0.1 ETH",
    currentPrice: "0.12 ETH",
    seller: "0x1a2b...3c4d",
    verified: true,
    category: "Music",
    timeLeft: "2 days"
  },
  {
    id: 2,
    eventTitle: "DeFi Conference 2025",
    eventImage: "https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=400",
    date: "2025-02-28",
    time: "09:00",
    location: "Innovation Center, San Francisco",
    originalPrice: "0.05 ETH",
    currentPrice: "0.06 ETH",
    seller: "0x5e6f...7g8h",
    verified: true,
    category: "Conference",
    timeLeft: "5 hours"
  },
  {
    id: 3,
    eventTitle: "Web3 Gaming Summit",
    eventImage: "https://images.pexels.com/photos/7915437/pexels-photo-7915437.jpeg?auto=compress&cs=tinysrgb&w=400",
    date: "2025-04-10",
    time: "10:00",
    location: "Tech Hub, Austin",
    originalPrice: "0.08 ETH",
    currentPrice: "0.075 ETH",
    seller: "0x9i0j...1k2l",
    verified: false,
    category: "Gaming",
    timeLeft: "1 day"
  },
  {
    id: 4,
    eventTitle: "Crypto Art Auction",
    eventImage: "https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=400",
    date: "2025-03-20",
    time: "15:00",
    location: "Metropolitan Gallery, NYC",
    originalPrice: "0.15 ETH",
    currentPrice: "0.2 ETH",
    seller: "0xabcd...efgh",
    verified: true,
    category: "Art",
    timeLeft: "3 days"
  }
];

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('price-low');
  const [filterCategory, setFilterCategory] = useState('all');

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
        default:
          return 0;
      }
    });

  const buyTicket = (listing: any) => {
    alert(`Purchasing ${listing.eventTitle} for ${listing.currentPrice}`);
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
                  <h3 className="text-white font-semibold mb-2">Anti-Scalping Protection</h3>
                  <p className="text-gray-300 text-sm">
                    All tickets are sold at fair market prices with built-in anti-scalping measures. 
                    Maximum resale price is capped at 110% of original price to protect fans.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Marketplace Listings */}
          {filteredListings.length === 0 ? (
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm text-center py-12">
              <CardContent>
                <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-4">No tickets match your search</p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterCategory('all');
                  }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map((listing) => (
                <Card key={listing.id} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 overflow-hidden group">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={listing.eventImage}
                      alt={listing.eventTitle}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 flex space-x-2">
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
                      {new Date(listing.date).toLocaleDateString()} at {listing.time}
                    </div>
                    
                    <div className="flex items-center text-gray-300 text-sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      {listing.location}
                    </div>

                    <div className="border-t border-white/10 pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">Original Price</span>
                        <span className="text-gray-400 text-sm line-through">{listing.originalPrice}</span>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-white font-semibold">Current Price</span>
                        <span className="text-2xl font-bold text-purple-400">{listing.currentPrice}</span>
                      </div>
                      
                      <div className="text-xs text-gray-400 mb-4">
                        Seller: {listing.seller}
                      </div>

                      <Button
                        onClick={() => buyTicket(listing)}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
                      >
                        Buy Now
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
                <div className="text-3xl font-bold text-purple-400">2,847 ETH</div>
                <p className="text-gray-300 text-sm mt-2">Last 30 days</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-900/20 to-green-900/20 border-blue-500/30 text-center">
              <CardHeader>
                <CardTitle className="text-white">Tickets Sold</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400">15,692</div>
                <p className="text-gray-300 text-sm mt-2">All time</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-900/20 to-purple-900/20 border-green-500/30 text-center">
              <CardHeader>
                <CardTitle className="text-white">Average Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">0.087 ETH</div>
                <p className="text-gray-300 text-sm mt-2">Fair market value</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}