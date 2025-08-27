"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, Users, Search, Ticket, Shield, Zap, Menu, ShapesIcon } from 'lucide-react';
import Link from 'next/link';
import { useContract } from '@/hooks/useContract';
import { connectWallet } from '@/lib/web3';

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

const categoryImages: { [key: string]: string } = {
  music: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800',
  conference: 'https://images.pexels.com/photos/2833037/pexels-photo-2833037.jpeg?auto=compress&cs=tinysrgb&w=800',
  sports: 'https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg?auto=compress&cs=tinysrgb&w=800',
  art: 'https://images.pexels.com/photos/102127/pexels-photo-102127.jpeg?auto=compress&cs=tinysrgb&w=800',
  theater: 'https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg?auto=compress&cs=tinysrgb&w=800',
  workshop: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=800',
  default: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800'
};

const getEventImage = (metadata: any) => {
  const categoryAttribute = metadata.attributes?.find((attr: any) => attr.trait_type === 'Category');
  const category = categoryAttribute?.value.toLowerCase();
  return categoryImages[category] || categoryImages.default;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    account,
    isConnectedToCorrectNetwork,
    getEvents,
    mintTicket,
    isLoading,
    error,

  } = useContract();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load events on component mount
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const contractEvents = await getEvents();
      const eventsWithMetadata = contractEvents.map(event => {
        try {
          const metadataJson = atob(event.metadataURI.split(',')[1]);
          const metadata = JSON.parse(metadataJson);
          const catagory = metadata.attributes?.find((attr: any) => attr.trait_type === 'Category')?.value || 'General';

          return { ...event, image: metadata.image, description: metadata.description, catagory: catagory };
        } catch (e) {
          console.error("Failed to parse metadata for event", event.eventId, e);
          return { ...event, image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800', description: event.description };
        }
      });
      setEvents(eventsWithMetadata);
    } catch (error) {
      console.error('Failed to load events:', error);
      // Fallback to empty array if contract not deployed yet
      setEvents([]);
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      // Refresh the page to update connection status
      window.location.reload();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please make sure MetaMask is installed and try again.');
    }
  };

  const handleBuyTicket = async (event: any) => {
    if (!account || !isConnectedToCorrectNetwork) {
      alert('Please connect your wallet to Somnia testnet first');
      return;
    }

    try {
      // Create metadata for the ticket
      const tokenURI = `data:application/json;base64,${btoa(JSON.stringify({
        name: `${event.title} - NFT Ticket`,
        description: `Official NFT ticket for ${event.title}`,
        image: `${event.image}`,
        attributes: [
          { trait_type: "Event", value: event.title },
          { trait_type: "Date", value: event.date.toLocaleDateString() },
          { trait_type: "Location", value: event.location }
        ]
      }))}`;

      const result = await mintTicket(event.eventId, tokenURI, event.ticketPrice);
      alert(`Ticket purchased successfully! Transaction: ${result.txHash}`);

      // Reload events to update sold tickets count
      loadEvents();
    } catch (error: any) {
      alert(`Failed to purchase ticket: ${error.message}`);
    }
  };

  const filteredEvents = events.filter(event => {
    const now = new Date();
    return new Date(event.date) > now &&
      (event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase()))
  }
  );

  const handleScrollToEvents = () => {
    document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-900/80 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}>
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
            <Link href='/#events' className="text-white hover:text-purple-300 transition-colors">Events</Link>
            <Link href="/create" className="text-white hover:text-purple-300 transition-colors">Create Event</Link>
            <Link href="/manage" className="text-white hover:text-purple-300 transition-colors">Manage Event</Link>
            <Link href="/my-tickets" className="text-white hover:text-purple-300 transition-colors">My Tickets</Link>
            <Link href="/marketplace" className="text-white hover:text-purple-300 transition-colors">Marketplace</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleConnectWallet}
              className={`${isConnectedToCorrectNetwork
                ? 'disabled:opacity-100 bg-green-600 hover:bg-green-700 '
                : ' bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                } text-white border-0 hidden sm:flex`}
              disabled={!!account}
            >
              {account ? 'Connected ' + account.slice(0, 6) + '...' + account.slice(-4) : 'Connect Wallet'}
            </Button>
            <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900/90 backdrop-blur-lg py-4">
            <nav className="flex flex-col items-center space-y-4">
              <Link href="/#events" className="text-white hover:text-purple-300 transition-colors">Events</Link>
              <Link href="/create" className="text-white hover:text-purple-300 transition-colors">Create Event</Link>
              <Link href="/manage" className="text-white hover:text-purple-300 transition-colors">Manage Event</Link>
              <Link href="/my-tickets" className="text-white hover:text-purple-300 transition-colors">My Tickets</Link>
              <Link href="/marketplace" className="text-white hover:text-purple-300 transition-colors">Marketplace</Link>
              <Button
                onClick={handleConnectWallet}
                className={`${isConnectedToCorrectNetwork
                  ? 'disabled:opacity-100 bg-green-600 hover:bg-green-700 '
                  : ' bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                  } text-white border-0`}
                disabled={!!account}
              >
                {account ? 'Connected ' + account.slice(0, 6) + '...' + account.slice(-4) : 'Connect Wallet'}
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative py-20 px-4 pt-32">
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
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 px-8 py-4 text-lg" onClick={handleScrollToEvents}>
                Explore Events
              </Button>
              <Link href="/create">
                <Button size="lg" variant="outline" className="border-purple-400 text-purple-500 hover:bg-purple-200 px-8 py-4 text-lg">
                  Create Event
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-900 to-slate-900 opacity-30"></div>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-black/20 backdrop-blur-sm">
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
      <section id="events" className="py-16 px-4">
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

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-400 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-300">Loading events from blockchain...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm text-center py-12">
              <CardContent>
                <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-4">
                  {events.length === 0 ? 'No events available yet' : 'No events match your search'}
                </p>
                <Link href="/create">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0">
                    Create First Event
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <Card key={event.eventId} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-[1.02] overflow-hidden group">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-purple-600/90 text-white border-0">
                        Event #{event.eventId}
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
                      {event.date.toLocaleDateString()} at {event.date.toLocaleTimeString()}
                    </div>

                    <div className="flex items-center text-gray-300 text-sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-gray-300 text-sm">
                      <ShapesIcon className="h-4 w-4 mr-2" />
                      {event.catagory?.toUpperCase()}
                    </div>

                    <div className="flex items-center text-gray-300 text-sm">
                      <Users className="h-4 w-4 mr-2" />
                      {event.maxTickets - event.soldTickets} of {event.maxTickets} available
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <span className="text-2xl font-bold text-purple-400">
                        {event.ticketPrice} STT
                      </span>
                      <Button
                        onClick={() => handleBuyTicket(event)}
                        disabled={event.soldTickets >= event.maxTickets || !account}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 disabled:opacity-50"
                      >
                        {event.soldTickets >= event.maxTickets ? 'Sold Out' : 'Buy Ticket'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 backdrop-blur-lg bg-black/20 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-evenly">
            <div className='flex items-center justify-center flex-col'>
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

            {/* <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/events" className="hover:text-purple-300 transition-colors">Browse Events</Link></li>
                <li><Link href="/create" className="hover:text-purple-300 transition-colors">Create Event</Link></li>
                <li><Link href="/marketplace" className="hover:text-purple-300 transition-colors">Marketplace</Link></li>
                <li><Link href="/verify" className="hover:text-purple-300 transition-colors">Verify Ticket</Link></li>
              </ul>
            </div> */}

            {/* <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/help" className="hover:text-purple-300 transition-colors">Help Center</Link></li>
                <li><Link href="/docs" className="hover:text-purple-300 transition-colors">Documentation</Link></li>
                <li><Link href="/contact" className="hover:text-purple-300 transition-colors">Contact Us</Link></li>
                <li><Link href="/status" className="hover:text-purple-300 transition-colors">System Status</Link></li>
              </ul>
            </div> */}

            <div className='flex items-center justify-center flex-col'>
              <h4 className="font-semibold text-white mb-4">Network</h4>
              <div className="text-sm text-gray-400">
                <p>Built on Somnia Testnet</p>
                <p className="text-xs mt-2 bg-purple-900/30 p-2 rounded">
                  RPC: dream-rpc.somnia.network
                </p>
              </div>
            </div>
          </div>

          {/* <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 NFTicket. Built on blockchain technology for a transparent future.</p>
          </div> */}
        </div>
      </footer>
    </div>
  );
}