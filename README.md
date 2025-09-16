# 🎫 NFTix - Next-Generation Blockchain Event Ticketing

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-13+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19+-gray?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![Somnia Testnet](https://img.shields.io/badge/Somnia-Testnet-purple?style=for-the-badge)](https://somnia.network/)

_Revolutionary NFT-based event ticketing platform eliminating fraud and enabling true digital ownership_

[🚀 Live Demo](https://nftix1.vercel.app) • [🔗 Contract Explorer](https://shannon-explorer.somnia.network/address/0x520015670fd1F2774d3A68412AaC740309cE7607)

</div>

---

## ✨ Overview

**NFTix** transforms the traditional ticketing industry by leveraging blockchain technology to create **fraud-proof, transferable event tickets as unique NFTs**. Built on the **Somnia Testnet**, our platform ensures transparent ownership, eliminates counterfeiting, and provides a secure secondary marketplace with built-in anti-scalping mechanisms.

### 🎯 Key Problems We Solve

- **🚫 Ticket Fraud**: Counterfeit tickets cost the industry billions annually
- **💰 Scalping**: Unfair pricing and market manipulation
- **🔒 Ownership Issues**: No true ownership or transfer rights
- **📊 Lack of Transparency**: Opaque pricing and availability

---

## 🌟 Features

### 🎫 **NFT Ticketing System**

- Each ticket is a unique ERC721 NFT with immutable metadata
- Blockchain-verified authenticity prevents counterfeiting
- True digital ownership with full transfer rights
- Collectible memories that persist beyond the event

### 🛡️ **Anti-Scalping Protection**

- **110% Max Resale Cap**: Prevents excessive price inflation
- **24-Hour Transfer Cooldown**: Reduces rapid speculation
- **5% Organizer Royalty**: Ensures creators benefit from secondary sales
- **Price Transparency**: All transactions are publicly verifiable

### 🏪 **Integrated Marketplace**

- Secure peer-to-peer ticket transfers
- Built-in escrow system via smart contracts
- Real-time price discovery and validation
- Automated royalty distribution

### ✅ **Advanced Verification**

- QR code generation for seamless event entry
- Blockchain-based ticket validation
- Mobile scanner for organizers
- Real-time usage status tracking

### 📱 **User Experience & Mobile Support**

- **Responsive Design**: Optimized for all devices (desktop, tablet, mobile)
- **Android MetaMask Support**: Native integration with MetaMask mobile app
- **Deep Link Integration**: Direct connection via MetaMask app links
- **Mobile-First UI**: Touch-optimized interface for mobile users
- **Auto-Detection**: Automatically detects mobile devices and MetaMask browser
- **Connection Guidance**: Step-by-step instructions for mobile wallet setup
- **Real-time Updates**: Live blockchain data synchronization
- **Smooth Animations**: Enhanced user interface across all platforms

---

## 🏗️ Technology Stack

<table>
<tr>
<td><strong>Frontend</strong></td>
<td>Next.js 13 (App Router), React 18, TypeScript</td>
</tr>
<tr>
<td><strong>Styling</strong></td>
<td>Tailwind CSS, Lucide Icons</td>
</tr>
<tr>
<td><strong>Blockchain</strong></td>
<td>Solidity 0.8.19, ethers.js v6, Somnia Testnet</td>
</tr>
<tr>
<td><strong>Smart Contracts</strong></td>
<td>ERC721, ERC721URIStorage, Ownable, ReentrancyGuard</td>
</tr>
<tr>
<td><strong>Development</strong></td>
<td>Hardhat, TypeScript, ESLint</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **MetaMask** browser extension
- **Somnia testnet STT** for transactions

### 1️⃣ Installation

```bash
# Clone the repository
git clone https://github.com/nabil-repo/NFTix.git
cd NFTix

# Install dependencies
npm install
```

### 2️⃣ Environment Setup

Create a `.env.local` file:

```bash
# Smart Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=0x520015670fd1F2774d3A68412AaC740309cE7607

# Somnia Testnet Configuration
RPC_URL=https://dream-rpc.somnia.network
#(For Conrtact Deployment only)
PRIVATE_KEY=your_deployment_private_key_here
```

### 3️⃣ Network Configuration

Add **Somnia Testnet** to MetaMask:

| Field               | Value                                      |
| ------------------- | ------------------------------------------ |
| **Network Name**    | Somnia Testnet                             |
| **RPC URL**         | `https://dream-rpc.somnia.network`         |
| **Chain ID**        | `50312`                                    |
| **Currency Symbol** | `STT`                                      |
| **Block Explorer**  | `https://shannon-explorer.somnia.network/` |

### 4️⃣ Development Server

```bash
# Start the development server
npm run dev

# Open http://localhost:3000 in your browser
```

---

## 📖 Usage Guide

### 👥 **For Event Organizers**

1. **Connect Wallet**: Click "Connect Wallet" and connect to Somnia testnet
2. **Create Event**: Navigate to "Create Event" and fill in details:
   - Event title, description, and location
   - Date, time, and ticket price in STT
   - Maximum ticket capacity
   - Upload event image/poster
3. **Manage Event**: Use the dashboard to track sales and analytics
4. **Check-in Attendees**: Use the QR scanner for event entry

### 🎟️ **For Ticket Buyers**

1. **Browse Events**: Explore available events on the homepage
2. **Purchase Tickets**: Connect wallet and buy NFT tickets with STT
3. **View Collection**: Access "My Tickets" to see your NFT tickets
4. **Event Entry**: Present QR code at the event for validation
5. **Resale Option**: List tickets on the marketplace if needed

### 🏪 **Marketplace Features**

1. **List Tickets**: Put tickets up for resale
2. **Price Discovery**: Set fair prices within anti-scalping limits
3. **Secure Purchase**: Buy tickets through smart contract escrow
4. **Automatic Royalties**: Original organizers receive 5% on resales

---

## 🔧 Smart Contract Architecture

### **Key Features**

- **Event Management**: Complete lifecycle from creation to completion
- **Ticket Minting**: ERC721 NFTs with rich metadata
- **Marketplace Integration**: Built-in listing and purchasing
- **Anti-Scalping**: Price caps and transfer restrictions
- **Access Control**: Role-based permissions and verification

---

## 🛡️ Security Features

- **✅ ReentrancyGuard**: Prevents reentrancy attacks
- **✅ Access Control**: Organizer and owner permissions
- **✅ Input Validation**: Comprehensive parameter checking
- **✅ Price Controls**: Anti-scalping mechanisms
- **✅ Transfer Restrictions**: Cooldown periods
- **✅ Metadata Immutability**: Tamper-proof ticket data

---

## 🌐 Live Contract Information

| Network            | Address                                      | Explorer                                                                                                       |
| ------------------ | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Somnia Testnet** | `0x520015670fd1F2774d3A68412AaC740309cE7607` | [View on Explorer](https://shannon-explorer.somnia.network/address/0x520015670fd1F2774d3A68412AaC740309cE7607) |

**Deployment Details:**

- **Deployer**: `0x236322EB2858D87B2D2Efb00887845e7E7f4CB93`
- **Block Number**: `168,344,216`
- **Transaction**: `0x81619e8590abde43ea166f4bc9f6ecdae3216864e11207b19f527e95df4785d3`

---

## 🎨 Screenshots & Demo

### 🏠 **Homepage - Event Discovery**

_Modern, responsive interface showcasing live events with real-time blockchain data_
![Homepage](./public/screenshots/homepage.png)

### 🎫 **Event Creation Dashboard**

_Intuitive organizer interface for creating and managing events_

### 🏪 **Integrated Marketplace**

_Secure secondary market with anti-scalping protection_

### 📱 **Mobile Experience**

_Fully responsive design optimized for mobile ticket management_

---

## 📊 Project Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Smart Contract │    │   Blockchain    │
│   (Next.js)     │◄──►│   (NFTix.sol)    │◄──►│   (Somnia)      │
│                 │    │                  │    │                 │
│ • React UI      │    │ • Event Logic    │    │ • NFT Storage   │
│ • Web3 Connect  │    │ • Anti-Scalping  │    │ • Transaction   │
│ • State Mgmt    │    │ • Marketplace    │    │ • Validation    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  ▼
                    ┌──────────────────┐
                    │   User Wallet    │
                    │   (MetaMask)     │
                    │                  │
                    │ • Private Keys   │
                    │ • Transaction    │
                    │ • NFT Storage    │
                    └──────────────────┘
```

---

## 🔧 Development & Deployment

### **Local Development**

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### **Smart Contract Development Only**

```bash
# Compile contracts (if using local setup)
npx hardhat compile

# Run tests
npm test

# Deploy to testnet
npm run deploy:testnet
```

### **Environment Variables**

```env
# Required
NEXT_PUBLIC_CONTRACT_ADDRESS=0x520015670fd1F2774d3A68412AaC740309cE7607

# Optional (for advanced features)
RPC_URL=https://dream-rpc.somnia.network
PRIVATE_KEY=your_private_key_here
```

---

## 🚨 Troubleshooting

### **Common Issues**

#### **🔗 Connection Problems**

```
❌ "Please connect your wallet"
✅ Solution: Install MetaMask and add Somnia testnet configuration
```

#### **💰 Transaction Failures**

```
❌ "Insufficient payment" error
✅ Solution: Ensure you have enough STT and are using correct network
```

#### **⚡ Network Issues**

```
❌ "Network not supported"
✅ Solution: Switch MetaMask to Somnia testnet (Chain ID: 50312)
```

#### **🎫 Missing Tickets**

```
❌ Tickets not showing in "My Tickets"
✅ Solution: Refresh page or check if transaction was successful
```

---

## 🔮 Roadmap

### **Phase 1 - Foundation** ✅

- [x] Core NFT ticketing functionality
- [x] Anti-scalping mechanisms
- [x] Basic marketplace
- [x] QR code generation
- [x] Somnia testnet deployment
---

## 📞 Support

### **Connect With Me**

- **Email**: [nabil.aaaman@gmail.com]

---

<div align="center">

### 🎫 **Built for the Future of Event Ticketing**

_NFTix represents the next evolution in event management - where blockchain meets user experience to create fraud-proof, truly owned digital tickets._

**⭐ Star this project** • **🔔 Watch for updates**

</div>
