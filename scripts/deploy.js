// Deployment script for NFTicket smart contract
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🚀 Starting NFTicket contract deployment...');
  
  // Check if we have the required environment variables
  const privateKey = process.env.PRIVATE_KEY ;
  const rpcUrl = process.env.RPC_URL || 'https://dream-rpc.somnia.network';
  
  if (!privateKey) {
    console.error('❌ PRIVATE_KEY environment variable is required');
    process.exit(1);
  }
  
  // Connect to Somnia testnet
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log('📡 Connected to Somnia testnet');
  console.log('👤 Deployer address:', wallet.address);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log('💰 Deployer balance:', ethers.formatEther(balance), 'ETH');
  
  if (balance === 0n) {
    console.error('❌ Insufficient balance. Please fund your wallet with Somnia testnet ETH');
    process.exit(1);
  }
  
  // Read the contract source code
  const contractPath = path.join(__dirname, '../contracts/NFTicket.sol');
  
  if (!fs.existsSync(contractPath)) {
    console.error('❌ Contract file not found:', contractPath);
    console.log('📝 Please ensure the NFTicket.sol contract is in the contracts/ directory');
    process.exit(1);
  }
  
  console.log('📄 Contract file found');
  console.log('⚠️  Note: This script requires a Solidity compiler.');
  console.log('🔧 For production deployment, use Hardhat, Foundry, or Remix IDE');
  console.log('');
  console.log('📋 Manual deployment steps:');
  console.log('1. Copy the contract code from contracts/NFTicket.sol');
  console.log('2. Go to https://remix.ethereum.org/');
  console.log('3. Create a new file and paste the contract code');
  console.log('4. Compile the contract (Solidity 0.8.19+)');
  console.log('5. Deploy using Injected Web3 (MetaMask) on Somnia testnet');
  console.log('6. Copy the deployed contract address');
  console.log('7. Update NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local');
  console.log('');
  console.log('🌐 Somnia Testnet Details:');
  console.log('- RPC URL:', rpcUrl);
  console.log('- Chain ID: 501001');
  console.log('- Explorer: https://somnia-testnet-explorer.vercel.app');
  console.log('');
  console.log('💡 After deployment, update your .env.local file with:');
  console.log('NEXT_PUBLIC_CONTRACT_ADDRESS=<your_deployed_contract_address>');
}

main()
  .then(() => {
    console.log('✅ Deployment guide completed');
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });