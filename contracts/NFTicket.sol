// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTicket is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    Counters.Counter private _eventIdCounter;

    struct Event {
        uint256 eventId;
        string title;
        string description;
        string location;
        uint256 date;
        uint256 ticketPrice;
        uint256 maxTickets;
        uint256 soldTickets;
        address organizer;
        bool isActive;
        string metadataURI;
    }

    struct Ticket {
        uint256 tokenId;
        uint256 eventId;
        address owner;
        bool isUsed;
        uint256 purchaseTime;
        uint256 originalPrice;
    }

    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool active;
    }

    // Anti-scalping settings
    uint256 public constant MAX_RESALE_PERCENTAGE = 110; // 110% of original price
    uint256 public constant ROYALTY_PERCENTAGE = 5; // 5% royalty
    uint256 public constant TRANSFER_COOLDOWN = 24 hours;

    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;
    mapping(uint256 => uint256) public lastTransferTime;
    mapping(address => bool) public verifiedOrganizers;
    mapping(uint256 => Listing) public listings; // tokenId -> Listing

    event EventCreated(uint256 indexed eventId, address indexed organizer, string title);
    event TicketMinted(uint256 indexed tokenId, uint256 indexed eventId, address indexed buyer);
    event TicketUsed(uint256 indexed tokenId, uint256 indexed eventId);
    event TicketListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event TicketUnlisted(uint256 indexed tokenId, address indexed seller);
    event TicketBought(uint256 indexed tokenId, address indexed buyer, uint256 price);
    event TicketTransferred(uint256 indexed tokenId, address indexed from, address indexed to, uint256 price);

    constructor() ERC721("NFTicket", "NFTIX") Ownable() {}

    // -----------------------------
    // EVENT CREATION & MINTING
    // -----------------------------
    function createEvent(
        string memory _title,
        string memory _description,
        string memory _location,
        uint256 _date,
        uint256 _ticketPrice,
        uint256 _maxTickets,
        string memory _metadataURI
    ) external returns (uint256) {
        require(_date > block.timestamp, "Event date must be in the future");
        require(_ticketPrice > 0, "Ticket price must be greater than 0");
        require(_maxTickets > 0, "Max tickets must be greater than 0");

        _eventIdCounter.increment();
        uint256 eventId = _eventIdCounter.current();

        events[eventId] = Event({
            eventId: eventId,
            title: _title,
            description: _description,
            location: _location,
            date: _date,
            ticketPrice: _ticketPrice,
            maxTickets: _maxTickets,
            soldTickets: 0,
            organizer: msg.sender,
            isActive: true,
            metadataURI: _metadataURI
        });

        emit EventCreated(eventId, msg.sender, _title);
        return eventId;
    }

    function mintTicket(uint256 _eventId, string memory _tokenURI)
        external
        payable
        nonReentrant
        returns (uint256)
    {
        Event storage eventData = events[_eventId];
        require(eventData.isActive, "Event is not active");
        require(eventData.soldTickets < eventData.maxTickets, "Event is sold out");
        require(msg.value >= eventData.ticketPrice, "Insufficient payment");
        require(block.timestamp < eventData.date, "Event has already started");

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        tickets[tokenId] = Ticket({
            tokenId: tokenId,
            eventId: _eventId,
            owner: msg.sender,
            isUsed: false,
            purchaseTime: block.timestamp,
            originalPrice: eventData.ticketPrice
        });

        eventData.soldTickets++;
        lastTransferTime[tokenId] = block.timestamp;

        // Send payment to organizer (minus platform fee)
        uint256 platformFee = (msg.value * 5) / 100; // 5% platform fee
        uint256 organizerPayment = msg.value - platformFee;

        payable(eventData.organizer).transfer(organizerPayment);

        emit TicketMinted(tokenId, _eventId, msg.sender);
        return tokenId;
    }

    // -----------------------------
    // MARKETPLACE FUNCTIONS
    // -----------------------------
    function listTicket(uint256 _tokenId, uint256 _price) external {
        require(ownerOf(_tokenId) == msg.sender, "Not ticket owner");
        Ticket storage ticket = tickets[_tokenId];
        require(!ticket.isUsed, "Used ticket cannot be listed");
        //require(block.timestamp >= lastTransferTime[_tokenId] + TRANSFER_COOLDOWN,"Transfer cooldown not met");

        uint256 maxResalePrice = (ticket.originalPrice * MAX_RESALE_PERCENTAGE) / 100;
        require(_price <= maxResalePrice, "Exceeds max resale price");

        listings[_tokenId] = Listing({
            tokenId: _tokenId,
            seller: msg.sender,
            price: _price,
            active: true
        });

        emit TicketListed(_tokenId, msg.sender, _price);
    }

    function transferTicket(uint256 _tokenId, address _to, uint256 _price)
        external
        nonReentrant
    {
        require(ownerOf(_tokenId) != address(0), "Ticket does not exist");
        require(ownerOf(_tokenId) == msg.sender, "You don't own this ticket");
        require(_to != address(0), "Invalid recipient address");

        Ticket storage ticket = tickets[_tokenId];
        require(!ticket.isUsed, "Cannot transfer used ticket");
        //require(block.timestamp >= lastTransferTime[_tokenId] + TRANSFER_COOLDOWN,"Transfer cooldown period not met");

        // Anti-scalping: Check maximum resale price
        uint256 maxResalePrice = (ticket.originalPrice * MAX_RESALE_PERCENTAGE) / 100;
        require(_price <= maxResalePrice, "Price exceeds maximum resale limit");

        // Calculate royalty for original organizer
        Event storage eventData = events[ticket.eventId];
        uint256 royalty = (_price * ROYALTY_PERCENTAGE) / 100;
        uint256 sellerAmount = _price - royalty;

        // Transfer payment
        payable(msg.sender).transfer(sellerAmount);
        payable(eventData.organizer).transfer(royalty);

        // Transfer NFT
        _transfer(msg.sender, _to, _tokenId);
        ticket.owner = _to;
        lastTransferTime[_tokenId] = block.timestamp;

        emit TicketTransferred(_tokenId, msg.sender, _to, _price);
    }


    function cancelListing(uint256 _tokenId) external {
        Listing storage listing = listings[_tokenId];
        require(listing.active, "Not listed");
        require(listing.seller == msg.sender, "Not your listing");

        listing.active = false;
        emit TicketUnlisted(_tokenId, msg.sender);
    }

    function buyTicket(uint256 _tokenId) external payable nonReentrant {
        Listing storage listing = listings[_tokenId];
        require(listing.active, "Ticket not listed");
        require(msg.value >= listing.price, "Insufficient payment");

        Ticket storage ticket = tickets[_tokenId];
        Event storage eventData = events[ticket.eventId];

        // Royalty calculation
        uint256 royalty = (listing.price * ROYALTY_PERCENTAGE) / 100;
        uint256 sellerAmount = listing.price - royalty;

        // Payments
        payable(listing.seller).transfer(sellerAmount);
        payable(eventData.organizer).transfer(royalty);

        // Transfer NFT
        _transfer(listing.seller, msg.sender, _tokenId);
        ticket.owner = msg.sender;
        lastTransferTime[_tokenId] = block.timestamp;

        listing.active = false;

        emit TicketBought(_tokenId, msg.sender, listing.price);
    }

    // -----------------------------
    // OTHER FUNCTIONS (unchanged)
    // -----------------------------
    function useTicket(uint256 _tokenId) external {
        require(ownerOf(_tokenId) != address(0), "Ticket does not exist");
        Ticket storage ticket = tickets[_tokenId];
        Event storage eventData = events[ticket.eventId];

        require(
            msg.sender == eventData.organizer || msg.sender == owner(),
            "Only organizer or contract owner can mark tickets as used"
        );
        require(!ticket.isUsed, "Ticket already used");
        require(block.timestamp >= eventData.date, "Event has not started yet");

        ticket.isUsed = true;
        emit TicketUsed(_tokenId, ticket.eventId);
    }

    function fetchEvent(uint256 _eventId) external view returns (Event memory) {
        return events[_eventId];
    }

    function getTicket(uint256 _tokenId) external view returns (Ticket memory) {
        return tickets[_tokenId];
    }


    function getEventsByOrganizer(address _organizer) external view returns (uint256[] memory) {
        uint256[] memory organizerEvents = new uint256[](_eventIdCounter.current());
        uint256 count = 0;

        for (uint256 i = 1; i <= _eventIdCounter.current(); i++) {
            if (events[i].organizer == _organizer) {
                organizerEvents[count] = i;
                count++;
            }
        }

        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = organizerEvents[i];
        }

        return result;
    }

    function getTicketsByOwner(address _owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(_owner);
        uint256[] memory ownerTickets = new uint256[](balance);
        uint256 count = 0;

        for (uint256 i = 1; i <= _tokenIdCounter.current(); i++) {
            if (ownerOf(i) == _owner) {
                ownerTickets[count] = i;
                count++;
            }
        }

        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = ownerTickets[i];
        }

        return result;
    }


    function verifyOrganizer(address _organizer) external onlyOwner {
        verifiedOrganizers[_organizer] = true;
    }

    function deactivateEvent(uint256 _eventId) external {
        Event storage eventData = events[_eventId];
        require(
            msg.sender == eventData.organizer || msg.sender == owner(),
            "Only organizer or contract owner can deactivate event"
        );
        eventData.isActive = false;
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
