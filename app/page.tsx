"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, Users, Search, Ticket, Shield, Zap } from 'lucide-react';
import Link from 'next/link';

const featuredEvents = [
  {
    id: 1,
    title: "BlockChain Music Festival 2025",
    description: "The future of music meets blockchain technology",
    image: "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800",
    date: "2025-03-15",
    time: "18:00",
    location: "Crypto Arena, Los Angeles",
    price: "0.1 ETH",
    available: 245,
    total: 500,
    category: "Music"
  },
  {
    id: 2,
    title: "DeFi Conference 2025",
    description: "Leading voices in decentralized finance",
    image: "https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=800",
    date: "2025-02-28",
    time: "09:00",
    location: "Innovation Center, San Francisco",
    price: "0.05 ETH",
    available: 89,
    total: 200,
    category: "Conference"
  },
  {
    id: 3,
    title: "NFT Art Gallery Opening",
    description: "Exclusive digital art exhibition",
    image: "https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=800",
    date: "2025-02-20",
    time: "19:00",
    location: "Digital Gallery, New York",
    price: "0.02 ETH",
    available: 156,
    total: 300,
    category: "Art"
  }
];

const features = [
  {
    icon: <Shield className="h-8 w-8" />,
    title: "Fraud-Proof Tickets",
    description: "Each ticket is a unique NFT on the blockchain, making counterfeiting impossible"
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "Instant Transfers",
    description: "Transfer tickets instantly to friends or sell on our verified marketplace"
  },
  {
    icon: <Ticket className="h-8 w-8" />,
    title: "Collectible Memories",
    description: "Your tickets become permanent digital collectibles and memories"
  }
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    } else {
      alert('Please install MetaMask to use NFTicket');
    }
  };

  const filteredEvents = featuredEvents.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-lg bg-black/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Ticket className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              NFTicket
            </h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-white hover:text-purple-300 transition-colors">Events</Link>
            <Link href="/create" className="text-white hover:text-purple-300 transition-colors">Create Event</Link>
            <Link href="/my-tickets" className="text-white hover:text-purple-300 transition-colors">My Tickets</Link>
            <Link href="/marketplace" className="text-white hover:text-purple-300 transition-colors">Marketplace</Link>
          </nav>
          <Button
            onClick={connectWallet}
            className={`${isConnected
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
              } text-white border-0`}
          >
            {isConnected ? 'Connected' : 'Connect Wallet'}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              The Future of Event Tickets
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Secure, transparent, and fraud-proof NFT tickets on the Somnia blockchain.
              Buy, sell, and collect your favorite events as digital memories.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 px-8 py-4 text-lg">
                Explore Events
              </Button>
              <Button size="lg" variant="outline" className="border-purple-400 text-purple-300 hover:bg-purple-900/50 px-8 py-4 text-lg">
                Create Event
              </Button>
            </div>
          </div>
        </div>
      </section>
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-900 to-slate-900 opacity-30"></div>

      {/* Features Section */}
      <section className="py-16 px-4 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose NFTicket?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Experience the next generation of event ticketing with blockchain technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="mx-auto bg-gradient-to-br from-purple-500 to-blue-500 p-4 rounded-full w-fit mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Events Search Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Discover Events
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Find your next unforgettable experience
            </p>

            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search events, locations, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-[1.02] overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-purple-600/90 text-white border-0">
                      {event.category}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>

                <CardHeader>
                  <CardTitle className="text-white text-xl line-clamp-2">
                    {event.title}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {event.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center text-gray-300 text-sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(event.date).toLocaleDateString()} at {event.time}
                  </div>

                  <div className="flex items-center text-gray-300 text-sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.location}
                  </div>

                  <div className="flex items-center text-gray-300 text-sm">
                    <Users className="h-4 w-4 mr-2" />
                    {event.available} of {event.total} available
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <span className="text-2xl font-bold text-purple-400">
                      {event.price}
                    </span>
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0">
                      Buy Ticket
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 backdrop-blur-lg bg-black/20 py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Ticket className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">NFTicket</h3>
              </div>
              <p className="text-gray-400 text-sm">
                The future of event ticketing on the blockchain. Secure, transparent, and fraud-proof.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/events" className="hover:text-purple-300 transition-colors">Browse Events</Link></li>
                <li><Link href="/create" className="hover:text-purple-300 transition-colors">Create Event</Link></li>
                <li><Link href="/marketplace" className="hover:text-purple-300 transition-colors">Marketplace</Link></li>
                <li><Link href="/verify" className="hover:text-purple-300 transition-colors">Verify Ticket</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/help" className="hover:text-purple-300 transition-colors">Help Center</Link></li>
                <li><Link href="/docs" className="hover:text-purple-300 transition-colors">Documentation</Link></li>
                <li><Link href="/contact" className="hover:text-purple-300 transition-colors">Contact Us</Link></li>
                <li><Link href="/status" className="hover:text-purple-300 transition-colors">System Status</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Network</h4>
              <div className="text-sm text-gray-400">
                <p>Built on Somnia Testnet</p>
                <p className="text-xs mt-2 bg-purple-900/30 p-2 rounded">
                  RPC: dream-rpc.somnia.network
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 NFTicket. Built on blockchain technology for a transparent future.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}