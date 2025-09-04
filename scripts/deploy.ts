// import { ethers } from "hardhat";

// async function main() {
//   console.log("🚀 Starting NFTix contract deployment...");

//   const [deployer] = await ethers.getSigners();
//   console.log("👤 Deployer address:", deployer.address);

//   const balance = await ethers.provider.getBalance(deployer.address);
//   console.log("💰 Balance:", ethers.formatEther(balance), "ETH");

//   if (balance === 0n) {
//     throw new Error("❌ Insufficient balance. Please fund your wallet.");
//   }

//   const NFTix = await ethers.getContractFactory("NFTix");
//   const nfticket = await NFTix.deploy();

//   await nfticket.waitForDeployment();
//   console.log("📄 NFTix deployed at:", await nfticket.getAddress());
// }

// main().catch((err) => {
//   console.error("❌ Error deploying:", err);
//   process.exit(1);
// });
