type EventData = {
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  maxTickets: string;
  ticketPrice: string;
  image: File | null;  // <-- allow both File and null
};