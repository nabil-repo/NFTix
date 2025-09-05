"use client";

import { useEffect, useState } from "react";
import { useContract } from "@/hooks/useContract";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { formatAddress, formatPrice, getEventStatus } from "@/lib/contracts";
import { ArrowLeft, Ticket } from "lucide-react";
import Link from 'next/link';
import AlertDialog from "@/components/alert-dialog";
import Image from 'next/image';


interface EventMetadata {
    image?: string;
    [key: string]: any;
}

interface EventWithMetadata {
    metadataURI?: string | EventMetadata;
    [key: string]: any;
}

function getEventImage(event: EventWithMetadata): string {
    if (event && event.metadataURI) {
        if (typeof event.metadataURI === 'string' && event.metadataURI.startsWith('data:application/json;base64,')) {
            try {
                const base64 = event.metadataURI.replace('data:application/json;base64,', '');
                const json: EventMetadata = JSON.parse(typeof atob !== 'undefined' ? atob(base64) : Buffer.from(base64, 'base64').toString('utf-8'));
                return json.image || '';
            } catch (err) {
                return '';
            }
        }
        if (typeof event.metadataURI === 'object' && (event.metadataURI as EventMetadata).image) {
            return (event.metadataURI as EventMetadata).image!;
        }
    }
    return '';
}

export default function ManagePage() {
    const { account, getUserEvents, cancelListing } = useContract();
    const [events, setEvents] = useState<any[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');

    type TicketData = {
        tokenId: number;
        isUsed?: boolean;
        originalPrice?: number;
        owner?: string;
        event: EventWithMetadata & {
            title?: string;
            date?: Date;
            location?: string;
        };
    };

    const [tab, setTab] = useState("events");
    const [cancellingId, setCancellingId] = useState<string | null>(null);


    useEffect(() => {
        if (!account) return;
        loadData();
        // eslint-disable-next-line
    }, [account]);

    async function loadData() {
        setEvents(await getUserEvents());
    }

    async function handleCancelEvent(eventId: string) {
        setCancellingId(eventId);
        try {
            // Use contractService directly to avoid circular import
            const { contractService } = await import("@/lib/contracts");
            await contractService.deactivateEvent(eventId);
            await loadData();
        } catch (e) {
            setDialogTitle("Failed to cancel event");
            setDialogOpen(true);
        } finally {
            setCancellingId(null);
        }
    }

    // --- Analytics ---
    const totalEvents = events.length;
    const totalTicketsSold = events.reduce((sum, e) => sum + (e.soldTickets || 0), 0);
    const totalRevenue = events.reduce((sum, e) => sum + ((parseFloat(e.ticketPrice) || 0) * (e.soldTickets || 0)), 0);
    const avgTicketPrice = totalEvents > 0 ? (totalRevenue / totalTicketsSold || 0) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-6">

            <AlertDialog
                onCancel={() => { setDialogOpen(false) }}
                onConfirm={() => { setDialogOpen(false) }}
                open={dialogOpen}
                title={dialogTitle}
            />
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
                </div>
            </header>
            <div className="max-w-6xl mx-auto">
                {/* Improved Header */}
                <header className="mb-10 mt-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M12 2a2 2 0 0 1 2 2v1h2.5A2.5 2.5 0 0 1 19 7.5V9h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1v1.5A2.5 2.5 0 0 1 16.5 17H14v1a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-1H7.5A2.5 2.5 0 0 1 5 15.5V14H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h1V7.5A2.5 2.5 0 0 1 7.5 5H10V4a2 2 0 0 1 2-2Zm0 2V4v1.5A.5.5 0 0 1 11.5 6H7.5A.5.5 0 0 0 7 6.5V10a2 2 0 0 1-2 2H4v2h1a2 2 0 0 1 2 2v3.5c0 .28.22.5.5.5H10a2 2 0 0 1 2 2v1a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5V14a2 2 0 0 1 2-2h1v-2h-1a2 2 0 0 1-2-2V6.5a.5.5 0 0 0-.5-.5h-4A.5.5 0 0 1 12 5.5V4Z" /></svg>
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Manage Events & Sales</h1>
                            <div className="text-gray-300 text-base md:text-lg mt-1">Analytics, event management, and ticket sales in one place</div>
                        </div>
                    </div>
                    <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mt-2 mb-2" />
                </header>

                {/* Analytics Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-white/10 border-white/20">
                        <CardContent className="py-6 text-center">
                            <div className="text-2xl font-bold text-purple-300">{totalEvents}</div>
                            <div className="text-gray-300 text-sm mt-1">Total Events</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/10 border-white/20">
                        <CardContent className="py-6 text-center">
                            <div className="text-2xl font-bold text-blue-300">{totalTicketsSold}</div>
                            <div className="text-gray-300 text-sm mt-1">Tickets Sold</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/10 border-white/20">
                        <CardContent className="py-6 text-center">
                            <div className="text-2xl font-bold text-green-300">{totalRevenue.toFixed(4)} STT</div>
                            <div className="text-gray-300 text-sm mt-1">Total Revenue</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/10 border-white/20">
                        <CardContent className="py-6 text-center">
                            <div className="text-2xl font-bold text-yellow-300">{avgTicketPrice.toFixed(4)} STT</div>
                            <div className="text-gray-300 text-sm mt-1">Avg. Ticket Price</div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs value={tab} onValueChange={setTab} className="w-full">

                    <TabsContent value="events">
                        {events.length === 0 ? (
                            <div className="text-gray-400 text-center py-12">No events found.</div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {events.map(event => (
                                    <Card key={event.eventId} className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden">
                                        <div className="relative h-40 overflow-hidden">
                                            <img src={getEventImage(event)} alt={event.title} className="w-full h-full object-cover" />
                                            <div className="absolute top-4 right-4">
                                                <Badge className="bg-purple-600/90 text-white border-0">{getEventStatus(event)}</Badge>
                                            </div>
                                        </div>
                                        <CardHeader>
                                            <CardTitle className="text-white text-lg line-clamp-2">{event.title}</CardTitle>
                                            <p className="text-purple-400 font-mono text-sm">Event #{event.eventId}</p>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="text-gray-300 text-sm">{event.date.toLocaleDateString()} at {event.date.toLocaleTimeString()}</div>
                                            <div className="text-gray-300 text-sm">{event.location}</div>
                                            <div className="text-gray-300 text-sm">Tickets Sold: {event.soldTickets} / {event.maxTickets}</div>
                                            <div className="text-gray-300 text-sm">Price: {formatPrice(event.ticketPrice)}</div>
                                            <div className="text-gray-300 text-sm">Organizer: {formatAddress(event.organizer)}</div>
                                            <button
                                                onClick={() => handleCancelEvent(event.eventId)}
                                                disabled={cancellingId === event.eventId || getEventStatus(event) !== 'active'}
                                                className="w-full mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {cancellingId === event.eventId ? 'Cancelling...' : 'Cancel Event'}
                                            </button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                </Tabs>
            </div>
        </div>
    );
}


