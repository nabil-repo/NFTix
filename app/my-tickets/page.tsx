
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, QrCode, Download, Share2, ArrowLeft, Ticket, Upload, Banknote } from 'lucide-react';
import Link from 'next/link';
import { useContract } from '@/hooks/useContract';
import { formatAddress, contractService } from '@/lib/contracts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import QRCode from 'react-qr-code'; // Import QRCode


import { Html5Qrcode } from 'html5-qrcode';
import { Label } from '@/components/ui/label';
import QrScanner from '@/components/QrScanner';


export default function MyTickets() {
  const [ticketToDownload, setTicketToDownload] = useState<any>(null);
  const ticketPreviewRef = useRef<HTMLDivElement>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const { account, getUserTickets, useTicket, isLoading } = useContract();
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [verifyTicketId, setVerifyTicketId] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isQrCodeDialogOpen, setIsQrCodeDialogOpen] = useState(false); // New state for QR code dialog
  const [qrCodeData, setQrCodeData] = useState(''); // New state for QR code data
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    if (account) {
      loadUserTickets();
    }
  }, [account]);

  const onScanSuccess = (decodedText: string, decodedResult: any) => {
    try {
      const qrData = JSON.parse(decodedText);
      if (qrData.tokenId) {
        setVerifyTicketId(qrData.tokenId);
        handleVerifyTicket(qrData.tokenId);
        setIsScannerOpen(false);
        setIsVerifyDialogOpen(true);
      }
    } catch (error) {
      console.error("Failed to parse QR code:", error);
      setVerificationResult({ isValid: false, message: "Invalid QR code." });
    }
  };

  // Helper to extract image URL from event metadataURI (base64-encoded JSON or direct URL)
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
  const onScanFailure = (error: any) => {
    // console.warn(`Code scan error = ${error}`);
  };

  const loadUserTickets = async () => {
    try {
      const userTickets = await getUserTickets();
      const uniqueTickets = Array.from(new Set(userTickets.map(t => t.tokenId)))
        .map(id => userTickets.find(t => t.tokenId === id));

      console.log('User tickets:', uniqueTickets);
      setTickets(uniqueTickets);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    }
  };

  const handleVerifyTicket = async (ticketId?: string) => {
    const idToVerify = ticketId || verifyTicketId;
    if (!idToVerify) return;
    try {
      const result = await contractService.verifyTicket(idToVerify);
      setVerificationResult(result);
    } catch (error) {
      console.error('Failed to verify ticket:', error);
      setVerificationResult({ isValid: false, message: 'Verification failed.' });
    }
  };

  const activeTickets = tickets.filter(ticket => !ticket.isUsed && new Date() < ticket.event.date);
  const usedTickets = tickets.filter(ticket => ticket.isUsed || new Date() >= ticket.event.date);

  const generateQRCode = (ticketId: string) => {
    const qrData = {
      tokenId: ticketId,
      contract: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
      network: 'somnia-testnet'
    };
    setQrCodeData(JSON.stringify(qrData)); // Set QR code data
    setIsQrCodeDialogOpen(true); // Open QR code dialog
  };

  const downloadTicket = async (ticket: any) => {
    setTicketToDownload(ticket);
    // Wait for the DOM to update and render the preview
    requestAnimationFrame(() => {
      setTimeout(async () => {
        if (ticketPreviewRef.current) {
          try {
            const htmlToImage = await import('html-to-image');
            const dataUrl = await htmlToImage.toPng(ticketPreviewRef.current);
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `nft-ticket-${ticket.tokenId}.png`;
            link.click();
          } catch (error) {
            alert('Failed to generate ticket image.');
          }
        }
        setTicketToDownload(null);
      }, 500);
    });
  };




  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
      {/* Hidden Ticket Preview for PNG Download */}
      {ticketToDownload && (
        <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 5, padding: 24 }} ref={ticketPreviewRef}>
          <div style={{ width: 350, border: '2px solid #a78bfa', borderRadius: 16, background: '#18181b', color: 'white', fontFamily: 'sans-serif', boxShadow: '0 4px 24px #0008', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(90deg,#a78bfa,#38bdf8)', padding: 12, borderTopLeftRadius: 14, borderTopRightRadius: 14 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{ticketToDownload.event.title}</h2>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ marginBottom: 8, fontSize: 16 }}>
                <b>Date:</b> {ticketToDownload.event.date.toLocaleDateString()} {ticketToDownload.event.date.toLocaleTimeString()}
              </div>
              <div style={{ marginBottom: 8, fontSize: 16 }}>
                <b>Location:</b> {ticketToDownload.event.location}
              </div>
              <div style={{ marginBottom: 8, fontSize: 16 }}>
                <b>Owner:</b> {formatAddress(ticketToDownload.owner)}
              </div>
              <div style={{ marginBottom: 8, fontSize: 16 }}>
                <b>Price:</b> {ticketToDownload.originalPrice} STT
              </div>
              <div style={{ marginBottom: 8, fontSize: 16 }}>
                <b>Token ID:</b> #{ticketToDownload.tokenId}
              </div>
              <div style={{ marginBottom: 8, fontSize: 16 }}>
                <b>Purchased on :</b> {ticketToDownload.purchaseTime.toLocaleDateString()} {ticketToDownload.purchaseTime.toLocaleTimeString()}
              </div>
              <div style={{ margin: '16px auto', width: 128, background: 'white', padding: 8, borderRadius: 8 }}>
                <QRCode value={JSON.stringify({ tokenId: ticketToDownload.tokenId, contract: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS, network: 'somnia-testnet' })} size={112} level="H" />
              </div>
              <div style={{ fontSize: 12, color: '#a1a1aa', textAlign: 'center' }}>NFTix - {new Date().getFullYear()}</div>
            </div>
          </div>
        </div>
      )}
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
              NFTix
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
            <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="mt-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white border-0"
                >
                  <QrCode className="h-5 w-5 mr-2" />
                  Verify a Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-purple-500 text-white">
                <DialogHeader>
                  <DialogTitle>Verify Ticket</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <Input
                    placeholder="Enter Ticket ID"
                    value={verifyTicketId}
                    onChange={(e) => setVerifyTicketId(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Button onClick={() => handleVerifyTicket()} className="mt-4 w-full bg-purple-600 hover:bg-purple-700">
                    Verify
                  </Button>
                  <Button onClick={() => { setIsVerifyDialogOpen(false); setIsScannerOpen(true); }} className="mt-4 w-full bg-blue-600 hover:bg-blue-700">
                    <QrCode className="h-5 w-5 mr-2" />
                    Scan QR Code
                  </Button>
                  <div className="mt-4">
                    <Label htmlFor="qr-upload" className="text-white">Upload QR Code</Label>
                    <Input
                      id="qr-upload"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const html5QrCode = new Html5Qrcode("reader", false);
                          try {
                            const decodedText = await html5QrCode.scanFile(file, false);
                            onScanSuccess(decodedText, {});
                          } catch (err) {
                            onScanFailure(err);
                          }
                        }
                      }}
                      className="bg-slate-700 border-slate-600 text-white mt-2"
                    />
                  </div>
                </div>
                {verificationResult && (
                  <div className="mt-4 p-4 rounded-lg bg-slate-700">
                    <h3 className={`text-lg font-bold ${verificationResult.isValid ? 'text-green-400' : 'text-red-400'}`}>
                      {verificationResult.message}
                    </h3>
                    {verificationResult.ticket?.tokenId && (
                      <div className="mt-2 text-sm text-slate-300">
                        <p><strong>Ticket ID:</strong> {verificationResult.ticket.tokenId}</p>
                        <p><strong>Event:</strong> {verificationResult.event.title}</p>
                        <p><strong>Owner:</strong> {formatAddress(verificationResult.ticket.owner)}</p>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          {/* QR Code Scanner Dialog */}
          <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
            <DialogContent className="bg-slate-800 border-purple-500 text-white">
              <DialogHeader>
                <DialogTitle>Scan QR Code</DialogTitle>
              </DialogHeader>
              {isScannerOpen && <QrScanner onScanSuccess={onScanSuccess} onScanFailure={onScanFailure} />}
            </DialogContent>
          </Dialog>

          {/* QR Code Dialog */}
          <Dialog open={isQrCodeDialogOpen} onOpenChange={setIsQrCodeDialogOpen}>
            <DialogContent className="bg-slate-800 border-purple-500 text-white flex flex-col items-center">
              <DialogHeader>
                <DialogTitle>Scan QR Code</DialogTitle>
              </DialogHeader>
              <div className="mt-4 p-4 bg-white rounded-lg">
                {qrCodeData && <QRCode value={qrCodeData} size={256} level="H" />}
              </div>
              <p className="mt-2 text-sm text-slate-300 text-center">
                Scan this QR code to verify the ticket.
              </p>
            </DialogContent>
          </Dialog>

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
                          src={getEventImage(ticket.event)}
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
                          <Banknote className="h-4 w-4 mr-2" />
                          {ticket.purchaseTime.toLocaleDateString()} at {ticket.purchaseTime.toLocaleTimeString()}
                        </div>

                        <div className="flex items-center text-gray-300 text-sm">
                          <MapPin className="h-4 w-4 mr-2" />
                          {ticket.event.location}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-purple-400">
                            {ticket.originalPrice} STT
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
                            {/* <Button
                              size="sm"
                              variant="outline"
                              className="border-purple-400 text-purple-300 hover:bg-purple-900/50"
                              onClick={() => shareTicket(ticket)}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button> */}
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
                          src={getEventImage(ticket.event)}
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
                          <Banknote className="h-4 w-4 mr-2" />
                          {ticket.purchaseTime.toLocaleDateString()} at {ticket.purchaseTime.toLocaleTimeString()}
                        </div>

                        <div className="flex items-center text-gray-300 text-sm">
                          <MapPin className="h-4 w-4 mr-2" />
                          {ticket.event.location}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-400">
                            {ticket.originalPrice} STT
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