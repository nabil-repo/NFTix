"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, QrCode, Download, Share2, ArrowLeft, Ticket } from 'lucide-react';
import Link from 'next/link';
import { useContract } from '@/hooks/useContract';
import { formatAddress } from '@/lib/contracts';

export default function MyTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const { account, getUserTickets, useTicket, isLoading } = useContract();

  useEffect(() => {
    if (account) {
      loadUserTickets();
    }
  }, [account]);

  const loadUserTickets = async () => {
    try {
      const userTickets = await getUserTickets();
      setTickets(userTickets);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    }
  };

  const activeTickets = tickets.filter(ticket => !ticket.isUsed && new Date() < ticket.event.date);
  const usedTickets = tickets.filter(ticket => ticket.isUsed || new Date() >= ticket.event.date);

  const generateQRCode = (ticketId: string) => {
    // Generate QR code data with ticket verification info
    const qrData = {
      tokenId: ticketId,
      contract: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
      network: 'somnia-testnet'
    };
    
    // In a real app, you would use a QR code library
    const qrString = JSON.stringify(qrData);
    alert(`QR Code data: ${qrString}`);
  };

  const downloadTicket = (ticket: any) => {
    // Create downloadable ticket data
    const ticketData = {
      tokenId: ticket.tokenId,
      eventTitle: ticket.event.title,
      eventDate: ticket.event.date,
      location: ticket.event.location,
      owner: ticket.owner,
      purchaseTime: ticket.purchaseTime,
      originalPrice: ticket.originalPrice
    };
    
    const dataStr = JSON.stringify(ticketData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `nft-ticket-${ticket.tokenId}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const shareTicket = (ticket: any) => {
    if (navigator.share) {
      navigator.share({
        title: `NFT Ticket - ${ticket.event.title}`,
        text: `Check out my NFT ticket for ${ticket.event.title}!`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      const shareText = `Check out my NFT ticket for ${ticket.event.title}! Token ID: ${ticket.tokenId}`;
      navigator.clipboard.writeText(shareText);
      alert('Ticket info copied to clipboard!');
    }
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
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">My NFT Tickets</h1>
            <p className="text-gray-300 text-lg">
              Your collection of event memories on the blockchain
            </p>
          </div>

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/10 border-white/20">
              <TabsTrigger value="active" className="data-[state=active]:bg-purple-600">
                Active Tickets ({activeTickets.length})
              </TabsTrigger>
              <TabsTrigger value="used" className="data-[state=active]:bg-purple-600">
                Past Events ({usedTickets.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-8">
              {activeTickets.length === 0 ? (
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm text-center py-12">
                  <CardContent>
                    <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-4">
                      {!account ? 'Connect your wallet to view tickets' : 'No active tickets yet'}
                    </p>
                    <Link href="/">
                      <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0">
                        Browse Events
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeTickets.map((ticket) => (
                    <Card key={ticket.tokenId} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 overflow-hidden group">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src="https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400"
                          alt={ticket.event.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-green-600/90 text-white border-0">
                            Active
                          </Badge>
                        </div>
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-purple-600/90 text-white border-0">
                            #{ticket.tokenId}
                          </Badge>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      </div>
                      
                      <CardHeader>
                        <CardTitle className="text-white text-lg line-clamp-2">
                          {ticket.event.title}
                        </CardTitle>
                        <p className="text-purple-400 font-mono text-sm">
                          Token #{ticket.tokenId}
                        </p>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="flex items-center text-gray-300 text-sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          {ticket.event.date.toLocaleDateString()} at {ticket.event.date.toLocaleTimeString()}
                        </div>
                        
                        <div className="flex items-center text-gray-300 text-sm">
                          <MapPin className="h-4 w-4 mr-2" />
                          {ticket.event.location}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-purple-400">
                            {ticket.originalPrice} ETH
                          </span>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-purple-400 text-purple-300 hover:bg-purple-900/50"
                              onClick={() => generateQRCode(ticket.tokenId)}
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-purple-400 text-purple-300 hover:bg-purple-900/50"
                              onClick={() => downloadTicket(ticket)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-purple-400 text-purple-300 hover:bg-purple-900/50"
                              onClick={() => shareTicket(ticket)}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="text-xs text-gray-400 font-mono bg-black/30 p-2 rounded">
                          Owner: {formatAddress(ticket.owner)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="used" className="mt-8">
              {usedTickets.length === 0 ? (
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm text-center py-12">
                  <CardContent>
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No past events yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {usedTickets.map((ticket) => (
                    <Card key={ticket.tokenId} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 overflow-hidden group opacity-80">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src="https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400"
                          alt={ticket.event.title}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                        />
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-gray-600/90 text-white border-0">
                            {ticket.isUsed ? 'Used' : 'Expired'}
                          </Badge>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      </div>
                      
                      <CardHeader>
                        <CardTitle className="text-white text-lg line-clamp-2">
                          {ticket.event.title}
                        </CardTitle>
                        <p className="text-purple-400 font-mono text-sm">
                          Token #{ticket.tokenId}
                        </p>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="flex items-center text-gray-300 text-sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          {ticket.event.date.toLocaleDateString()} at {ticket.event.date.toLocaleTimeString()}
                        </div>
                        
                        <div className="flex items-center text-gray-300 text-sm">
                          <MapPin className="h-4 w-4 mr-2" />
                          {ticket.event.location}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-400">
                            {ticket.originalPrice} ETH
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-400 text-gray-300 hover:bg-gray-900/50"
                            onClick={() => downloadTicket(ticket)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>

                        <div className="text-xs text-gray-400 font-mono bg-black/30 p-2 rounded">
                          Owner: {formatAddress(ticket.owner)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}