import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting NFTicket contract deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    throw new Error("❌ Insufficient balance. Please fund your wallet.");
  }

  const NFTicket = await ethers.getContractFactory("NFTicket");
  const nfticket = await NFTicket.deploy();

  await nfticket.waitForDeployment();
  console.log("📄 NFTicket deployed at:", await nfticket.getAddress());
}

main().catch((err) => {
  console.error("❌ Error deploying:", err);
  process.exit(1);
});
