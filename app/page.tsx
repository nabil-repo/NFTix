"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, Users, Search, Ticket, Shield, Zap, Menu, VenetianMask, ShapesIcon, QrCode } from 'lucide-react';
import Link from 'next/link';
import { useContract } from '@/hooks/useContract';
import { connectWallet, isMobileDevice } from '@/lib/web3';
import { contractService, formatAddress } from '@/lib/contracts';
import AlertDialog from '@/components/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import QrScanner from '@/components/QrScanner';
import Image from 'next/image';
import WalletConnect from '@/components/WalletConnect';

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
  },
  {
    icon: <VenetianMask className="h-8 w-8" />,
    title: "Anti-Speculation Mechanisms",
    description: "Transfer cooldown periods (24 hours) prevent rapid speculation."
  }
];




export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  // Lazy load state
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(9); // 10 events per page (0-9)
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Ticket verification state
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [verifyTicketId, setVerifyTicketId] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

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

  // Load events on mount and when from/to changes
  useEffect(() => {
    if (!hasMore && from !== 0) return;
    const fetchEvents = async () => {
      setLoadingMore(true);
      try {
        const contractEvents = await getEvents(from, to);
        const eventsWithMetadata = contractEvents.map(event => {
          try {
            const metadataJson = atob(event.metadataURI.split(',')[1]);
            const metadata = JSON.parse(metadataJson);
            const catagory = metadata.attributes?.find((attr: any) => attr.trait_type === 'Category')?.value || 'General';
            return { ...event, image: metadata.image, description: metadata.description, catagory: catagory };
          } catch (e) {
            console.error("Failed to parse metadata for event", event.eventId, e);
            return { ...event, image: '', description: event.description };
          }
        });
        if (eventsWithMetadata.length === 0) {
          setHasMore(false);
        } else {
          setEvents(prev => from === 0 ? eventsWithMetadata : [...prev, ...eventsWithMetadata]);
          if (eventsWithMetadata.length < to - from + 1) {
            setHasMore(false);
          }
        }
      } catch (error) {
        console.error('Failed to load events:', error);
        if (from === 0) setEvents([]);
        setHasMore(false);
      } finally {
        setLoadingMore(false);
      }
    };
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  // Load more handler
  const handleLoadMore = () => {
    setFrom(prev => prev + 10);
    setTo(prev => prev + 10);
  };

  // Ticket verification functions
  const handleVerifyTicket = async (ticketId?: string) => {
    const idToVerify = ticketId || verifyTicketId;
    if (!idToVerify) return;
    try {
      const result = await contractService.verifyTicket(idToVerify);
      setVerificationResult(result);
      setIsVerifyDialogOpen(true);
    } catch (error) {
      console.error('Failed to verify ticket:', error);
      setVerificationResult({ isValid: false, message: 'Verification failed.' });
      setIsVerifyDialogOpen(true);
    }
  };

  const onScanSuccess = (decodedText: string, decodedResult: any) => {
    try {
      const qrData = JSON.parse(decodedText);
      if (qrData.tokenId) {
        setVerifyTicketId(qrData.tokenId);
        handleVerifyTicket(qrData.tokenId);
        setIsScannerOpen(false);
      }
    } catch (error) {
      console.error("Failed to parse QR code:", error);
      setVerificationResult({ isValid: false, message: "Invalid QR code." });
      setIsVerifyDialogOpen(true);
      setIsScannerOpen(false);
    }
  };

  const onScanFailure = (error: any) => {
    console.error("QR Code scan failed:", error);
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      // Refresh the page to update connection status
      window.location.reload();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setDialogTitle('Failed to connect wallet. Please make sure MetaMask is installed and try again.');
      setDialogOpen(true);
    }
  };

  const handleBuyTicket = async (event: any) => {
    if (!account || !isConnectedToCorrectNetwork) {
      setDialogTitle('Please connect your wallet to Somnia testnet first');
      setDialogOpen(true);
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
      setDialogTitle(`Ticket purchased successfully! Transaction: ${result.txHash}`);
      setDialogOpen(true);

      // Reload events to update sold tickets count
      setFrom(0);
      setTo(9);
      setHasMore(true);
    } catch (error: any) {
      setDialogTitle(`Failed to purchase ticket: ${error.message}`);
      setDialogOpen(true);
    }
  };

  const filteredEvents = events.filter(event => {
    const now = new Date();
    return new Date(event.date) > now &&
      (event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase()))
  });

  const handleScrollToEvents = () => {
    document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AlertDialog
        onCancel={() => { setDialogOpen(false) }}
        onConfirm={() => { setDialogOpen(false) }}
        open={dialogOpen}
        title={dialogTitle}
      />
      {/* Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-900/80 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center"> */}
            {/* <Ticket className="h-6 w-6 text-white" /> */}
            <Image src="/icon2.png" alt="Ticket Icon" width={60} height={10} />
            {/* </div> */}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              NFTix
            </h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href='/#events' className="text-white hover:text-purple-300 transition-colors">Events</Link>
            <Link href="/create" className="text-white hover:text-purple-300 transition-colors">Create Event</Link>
            <Link href="/manage" className="text-white hover:text-purple-300 transition-colors">Manage Event</Link>
            <Link href="/my-tickets" className="text-white hover:text-purple-300 transition-colors">My Tickets</Link>
            <Link href="/marketplace" className="text-white hover:text-purple-300 transition-colors">Marketplace</Link>

            {/* Ticket Verification */}
            <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Verify Ticket
                </Button>
              </DialogTrigger>
            </Dialog>
          </nav>
          <div className="flex items-center space-x-4">
            {/* <Button
              onClick={handleConnectWallet}
              className={`${isConnectedToCorrectNetwork
                ? 'disabled:opacity-100 bg-green-600 hover:bg-green-700 '
                : ' bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                } text-white border-0 hidden sm:flex`}
              disabled={!!account}
            >
              {account ? 'Connected ' + account.slice(0, 6) + '...' + account.slice(-4) : 'Connect Wallet'}
            </Button> */}
            {!isMobileDevice() && <WalletConnect />}
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
                variant="outline"
                size="sm"
                className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
                onClick={() => setIsVerifyDialogOpen(true)}
              >
                <QrCode className="h-4 w-4 mr-2" />
                Verify Ticket
              </Button>
              {/* <Button
                onClick={handleConnectWallet}
                className={`${isConnectedToCorrectNetwork
                  ? 'disabled:opacity-100 bg-green-600 hover:bg-green-700 '
                  : ' bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                  } text-white border-0`}
                disabled={!!account}
              >
                {account ? 'Connected ' + account.slice(0, 6) + '...' + account.slice(-4) : 'Connect Wallet'}
              </Button> */}
              <WalletConnect />
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
              Why Choose NFTix?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Experience the next generation of event ticketing with blockchain technology
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shine bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
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

          {loadingMore && from === 0 ? (
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
            <>
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
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 px-8 py-3"
                  >
                    {loadingMore ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Ticket Verification Dialogs */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent className="bg-slate-800 border-purple-500 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ticket-id" className="text-white">Enter Ticket ID</Label>
              <Input
                id="ticket-id"
                value={verifyTicketId}
                onChange={(e) => setVerifyTicketId(e.target.value)}
                placeholder="Enter ticket token ID..."
                className="mt-1 bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleVerifyTicket()}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={!verifyTicketId.trim()}
              >
                <QrCode className="h-4 w-4 mr-2" />
                Verify
              </Button>
              <Button
                onClick={() => setIsScannerOpen(true)}
                variant="outline"
                className="flex-1 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
              >
                Scan QR
              </Button>
            </div>

            {verificationResult && (
              <div className={`p-4 rounded-lg ${verificationResult.isValid ? 'bg-green-900/30 border border-green-500' : 'bg-red-900/30 border border-red-500'}`}>
                <h3 className={`font-semibold ${verificationResult.isValid ? 'text-green-400' : 'text-red-400'}`}>
                  {verificationResult.isValid ? '✅ Valid Ticket' : '❌ Invalid Ticket'}
                </h3>
                <p className="text-sm mt-2 text-gray-300">{verificationResult.message}</p>
                {verificationResult.isValid && verificationResult.ticket && (
                  <div className="mt-3 text-sm space-y-1">
                    <p><strong>Token ID:</strong> {verificationResult.ticket.tokenId}</p>
                    <p><strong>Event:</strong> {verificationResult.event?.title}</p>
                    <p><strong>Owner:</strong> {formatAddress(verificationResult.ticket.owner)}</p>
                    <p><strong>Purchase Date:</strong> {new Date(verificationResult.ticket.purchaseTime).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> {verificationResult.ticket.isUsed ? 'Used' : 'Unused'}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Scanner Dialog */}
      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <DialogContent className="bg-slate-800 border-purple-500 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {isScannerOpen && <QrScanner onScanSuccess={onScanSuccess} onScanFailure={onScanFailure} />}
            <Button
              onClick={() => setIsScannerOpen(false)}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-white/10 backdrop-blur-lg bg-black/20 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-evenly">
            <div className='flex items-center justify-center flex-col'>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Ticket className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">NFTix</h3>
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
            <p>&copy; 2025 NFTix. Built on blockchain technology for a transparent future.</p>
          </div> */}
        </div>
      </footer>
    </div>
  );
}