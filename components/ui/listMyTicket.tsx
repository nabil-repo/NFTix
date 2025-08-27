"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function ListMyTicket({ userTickets, onListTicket }: {
  userTickets: { id: string; eventTitle: string, event: { title: string } }[],
  onListTicket: (ticketId: string, price: string) => void
}) {
  const [open, setOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string>("");
  const [price, setPrice] = useState<string>("");

  const handleSubmit = () => {
    if (!selectedTicket || !price) return;
    onListTicket(selectedTicket, price);
    setOpen(false);
    setSelectedTicket("");
    setPrice("");
  };

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>List My Ticket</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>List Your Ticket</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Select Ticket</Label>
              <Select onValueChange={setSelectedTicket} value={selectedTicket}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose your ticket" />
                </SelectTrigger>
                <SelectContent>
                  {userTickets.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      #{t.id} — {t.event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Set Price (STT)</Label>
              <Input
                type="number"
                min="0"
                step="0.001"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!selectedTicket || !price}>
              Confirm Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
