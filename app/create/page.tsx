"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Users, DollarSign, Upload, ArrowLeft, Ticket } from 'lucide-react';
import Link from 'next/link';
import { useContract } from '@/hooks/useContract';
import { useRouter } from 'next/navigation';


export default function CreateEvent() {
  const router = useRouter();
  const { account, isConnectedToCorrectNetwork, createEvent, isLoading } = useContract();

  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    time: '',
    location: '',
    maxTickets: '',
    ticketPrice: '',
    image: null as File | null,
  });


  const handleInputChange = (field: string, value: string) => {
    setEventData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account || !isConnectedToCorrectNetwork) {
      alert('Please connect your wallet to Somnia testnet first');
      return;
    }

    if (!eventData.title || !eventData.description || !eventData.location ||
      !eventData.date || !eventData.time || !eventData.maxTickets || !eventData.ticketPrice) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Combine date and time
      const eventDateTime = new Date(`${eventData.date}T${eventData.time}`);

      if (eventDateTime <= new Date()) {
        alert('Event date must be in the future');
        return;
      }

      // Create metadata URI
      const metadata = {
        name: eventData.title,
        description: eventData.description,
        image: "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg",
        attributes: [
          { trait_type: "Category", value: eventData.category },
          { trait_type: "Location", value: eventData.location },
          { trait_type: "Date", value: eventDateTime.toLocaleDateString() },
          { trait_type: "Max Tickets", value: eventData.maxTickets }
        ]
      };

      const metadataURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

      const contractEventData = {
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        date: eventDateTime,
        ticketPrice: eventData.ticketPrice,
        maxTickets: parseInt(eventData.maxTickets),
        metadataURI
      };

      const result = await createEvent(contractEventData);

      alert(`Event created successfully! Event ID: ${result.eventId}\nTransaction: ${result.txHash}`);

      // Redirect to home page
      router.push('/');

    } catch (error: any) {
      alert(`Failed to create event: ${error.message}`);
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
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Create Your Event</h1>
            <p className="text-gray-300 text-lg">
              Deploy your event as an NFT collection on the Somnia blockchain
            </p>
          </div>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-2xl flex items-center">
                <Upload className="h-6 w-6 mr-2" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Event Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">Event Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter event title..."
                    value={eventData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>

                {/* Event Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your event..."
                    value={eventData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[100px]"
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label className="text-white">Category</Label>
                  <Select onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select event category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="conference">Conference</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="art">Art</SelectItem>
                      <SelectItem value="theater">Theater</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-white flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={eventData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-white">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={eventData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-white flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="Event venue or online platform..."
                    value={eventData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>

                {/* Max Tickets and Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxTickets" className="text-white flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      Max Tickets
                    </Label>
                    <Input
                      id="maxTickets"
                      type="number"
                      placeholder="1000"
                      value={eventData.maxTickets}
                      onChange={(e) => handleInputChange('maxTickets', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ticketPrice" className="text-white flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Price (ETH)
                    </Label>
                    <Input
                      id="ticketPrice"
                      type="number"
                      step="0.001"
                      placeholder="0.1"
                      value={eventData.ticketPrice}
                      onChange={(e) => handleInputChange('ticketPrice', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image" className="text-white">Event Image</Label>
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">Drag and drop your event image here</p>
                    <p className="text-gray-500 text-sm">or click to browse files</p>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        setEventData(prev => ({ ...prev, image: e.target.files?.[0] || null }));

                      }
                      }
                    />
                  </div>
                </div>

                {/* Smart Contract Info */}
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Smart Contract Deployment</h3>
                  <p className="text-gray-300 text-sm">
                    Your event will be deployed as a smart contract on the Somnia testnet.
                    Each ticket will be minted as an NFT with unique metadata and anti-fraud protection.
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || !account || !isConnectedToCorrectNetwork}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 py-4 text-lg"
                >
                  {!account ? (
                    'Connect Wallet First'
                  ) : !isConnectedToCorrectNetwork ? (
                    'Switch to Somnia Testnet'
                  ) : isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-2"></div>
                      Deploying Smart Contract...
                    </>
                  ) : (
                    'Create Event & Deploy Contract'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Benefits Card */}
          <Card className="mt-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white">Why Create on NFTicket?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                <p className="text-gray-300 text-sm">Zero fraud - Each ticket is a unique NFT on the blockchain</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <p className="text-gray-300 text-sm">Transparent sales - All transactions visible on-chain</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                <p className="text-gray-300 text-sm">Instant payouts - Receive payments directly to your wallet</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <p className="text-gray-300 text-sm">Anti-scalping protection - Set transfer rules and royalties</p>
              </div>
            </CardContent>
          </Card>

          {!account && (
            <Card className="mt-8 bg-yellow-900/20 border-yellow-500/30">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-white font-semibold mb-2">Wallet Connection Required</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    You need to connect your wallet to create events on the blockchain.
                  </p>
                  <Link href="/">
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0">
                      Connect Wallet
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}