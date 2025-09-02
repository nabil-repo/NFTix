# NFTicket - Blockchain Event Ticketing Platform

## Features
NFTicket is a fully on-chain event ticketing platform that issues tickets as NFTs on the Somnia testnet. This eliminates fraud, enables secure transfers, and provides transparent ticket ownership.
- **🎫 NFT Tickets**: Each ticket is a unique NFT on the blockchain
- **🔒 Fraud-Proof**: Impossible to counterfeit blockchain-based tickets
- **💸 Anti-Scalping**: Built-in price limits and royalty system
- **🔄 Secure Transfers**: Safe peer-to-peer ticket transfers
- **📱 Mobile-First**: Responsive design for all devices
- **⚡ Real-Time**: Live blockchain data integration
## Smart Contract Features
- Event creation and management
- NFT ticket minting with metadata
- Anti-scalping protection (110% max resale price)
- Royalty system (5% to original organizer)
- Transfer cooldown periods
- Event check-in system
## Getting Started
### Prerequisites
- Node.js 18+ and npm
- MetaMask wallet
- Somnia testnet STT for transactions
### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
4. Deploy the smart contract (see deployment section)
5. Start the development server:
   ```bash
   npm run dev
   ```
### Smart Contract Deployment
1. **Using Remix IDE (Recommended)**:
   - Go to [Remix IDE](https://remix.ethereum.org/)
   - Create a new file and copy the contract from `contracts/NFTicket.sol`
   - Compile with Solidity 0.8.19+
   - Deploy using MetaMask on Somnia testnet
   - Copy the deployed contract address
2. **Update Configuration**:
   ```bash
   # In .env.local
   NEXT_PUBLIC_CONTRACT_ADDRESS=<your_deployed_contract_address>
   ```
### Somnia Testnet Setup
Add Somnia testnet to MetaMask:
- **Network Name**: Somnia Testnet
- **RPC URL**: https://dream-rpc.somnia.network
- **Chain ID**: 501001
- **Currency Symbol**: STT
- **Explorer**: https://somnia-testnet-explorer.vercel.app
## Usage
### For Event Organizers
1. Connect your wallet to Somnia testnet
2. Click "Create Event" and fill in event details
3. Deploy the event smart contract
4. Share your event for ticket sales
### For Attendees
1. Connect your wallet
2. Browse available events
3. Purchase NFT tickets with STT
4. View tickets in "My Tickets"
5. Use QR codes for event check-in
### For Secondary Market
1. List tickets on the marketplace
2. Anti-scalping protection ensures fair pricing
3. Automatic royalties to original organizers
4. Secure blockchain-based transfers
## Technology Stack
- **Frontend**: Next.js 13, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Blockchain**: Ethereum-compatible (Somnia testnet)
- **Smart Contracts**: Solidity 0.8.19+
- **Web3**: ethers.js v6
- **Icons**: Lucide React
## Smart Contract Architecture
The NFTicket contract includes:
- **ERC721**: Standard NFT functionality
- **Event Management**: Create and manage events
- **Ticket Minting**: Mint NFT tickets with metadata
- **Anti-Scalping**: Price limits and transfer cooldowns
- **Royalty System**: Automatic payments to organizers
- **Access Control**: Organizer verification system
## Security Features
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Access Control**: Role-based permissions
- **Price Validation**: Anti-scalping mechanisms
- **Transfer Cooldowns**: Prevents rapid speculation
- **Metadata Verification**: Immutable ticket data
## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
## License
This project is licensed under the MIT License.
## Support
For support and questions:
- Create an issue on GitHub
- Check the documentation
- Join our community discussions
---
Built with ❤️ for the future of event ticketing
(base) PS D:\Projects\NFT_ticketing\nft-ticketing> npx hardhat compile
[dotenv@17.2.1] injecting env (1) from .env -- tip: 🛠️  run anywhere with `dotenvx ruun -- yourcommand`
Compiled 1 Solidity file successfully (evm target: paris).
(base) PS D:\Projects\NFT_ticketing\nft-ticketing> 
(base) PS D:\Projects\NFT_ticketing\nft-ticketing> npx hardhat run scripts/deploy.js --network somnia-testnet


=== Deployment Summary ===
{
  "network": "somnia-testnet",
  "contractAddress": "0x1ded6Fb69011cd3b82C7e6218d24E12f083e967F",
  "deployer": "0x236322EB2858D87B2D2Efb00887845e7E7f4CB93",
  "platformWallet": "0x236322EB2858D87B2D2Efb00887845e7E7f4CB93",
  "blockNumber": 165905817,
  "transactionHash": "0x0bbb9c0071cc5a856eb19da8cf72e71294b93fc0891807c7dcf466160c399860"
}