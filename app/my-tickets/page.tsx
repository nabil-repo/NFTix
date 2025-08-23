"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, QrCode, Download, Share2, ArrowLeft, Ticket } from 'lucide-react';
import Link from 'next/link';

const myTickets = [
  {
    id: 1,
    eventTitle: "BlockChain Music Festival 2025",
    eventImage: "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400",
    date: "2025-03-15",
    time: "18:00",
    location: "Crypto Arena, Los Angeles",
    ticketNumber: "#NFT-001234",
    tokenId: "0x1a2b3c4d...",
    status: "active",
    price: "0.1 ETH",
    category: "Music"
  },
  {
    id: 2,
    eventTitle: "DeFi Conference 2025",
    eventImage: "https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=400",
    date: "2025-02-28",
    time: "09:00",
    location: "Innovation Center, San Francisco",
    ticketNumber: "#NFT-005678",
    tokenId: "0x5e6f7g8h...",
    status: "active",
    price: "0.05 ETH",
    category: "Conference"
  },
  {
    id: 3,
    eventTitle: "NFT Art Gallery Opening",
    eventImage: "https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=400",
    date: "2025-01-15",
    time: "19:00",
    location: "Digital Gallery, New York",
    ticketNumber: "#NFT-009876",
    tokenId: "0x9i0j1k2l...",
    status: "used",
    price: "0.02 ETH",
    category: "Art"
  }
];

export default function MyTickets() {
  const [selectedTicket, setSelectedTicket] = useState(null);

  const activeTickets = myTickets.filter(ticket => ticket.status === 'active');
  const usedTickets = myTickets.filter(ticket => ticket.status === 'used');

  const generateQRCode = (ticketId: string) => {
    // In a real app, this would generate an actual QR code
    alert(`QR Code generated for ticket ${ticketId}`);
  };

  const downloadTicket = (ticket: any) => {
    // In a real app, this would download the NFT ticket
    alert(`Downloading NFT ticket for ${ticket.eventTitle}`);
  };

  const shareTicket = (ticket: any) => {
    // In a real app, this would open sharing options
    alert(`Sharing ticket for ${ticket.eventTitle}`);
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
                    <p className="text-gray-400 text-lg mb-4">No active tickets yet</p>
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
                    <Card key={ticket.id} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 overflow-hidden group">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={ticket.eventImage}
                          alt={ticket.eventTitle}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-green-600/90 text-white border-0">
                            Active
                          </Badge>
                        </div>
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-purple-600/90 text-white border-0">
                            {ticket.category}
                          </Badge>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      </div>
                      
                      <CardHeader>
                        <CardTitle className="text-white text-lg line-clamp-2">
                          {ticket.eventTitle}
                        </CardTitle>
                        <p className="text-purple-400 font-mono text-sm">
                          {ticket.ticketNumber}
                        </p>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="flex items-center text-gray-300 text-sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(ticket.date).toLocaleDateString()} at {ticket.time}
                        </div>
                        
                        <div className="flex items-center text-gray-300 text-sm">
                          <MapPin className="h-4 w-4 mr-2" />
                          {ticket.location}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-purple-400">
                            {ticket.price}
                          </span>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-purple-400 text-purple-300 hover:bg-purple-900/50"
                              onClick={() => generateQRCode(ticket.ticketNumber)}
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
                          Token ID: {ticket.tokenId}
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
                    <Card key={ticket.id} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 overflow-hidden group opacity-80">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={ticket.eventImage}
                          alt={ticket.eventTitle}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                        />
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-gray-600/90 text-white border-0">
                            Used
                          </Badge>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      </div>
                      
                      <CardHeader>
                        <CardTitle className="text-white text-lg line-clamp-2">
                          {ticket.eventTitle}
                        </CardTitle>
                        <p className="text-purple-400 font-mono text-sm">
                          {ticket.ticketNumber}
                        </p>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="flex items-center text-gray-300 text-sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(ticket.date).toLocaleDateString()} at {ticket.time}
                        </div>
                        
                        <div className="flex items-center text-gray-300 text-sm">
                          <MapPin className="h-4 w-4 mr-2" />
                          {ticket.location}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-400">
                            {ticket.price}
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
                          Token ID: {ticket.tokenId}
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