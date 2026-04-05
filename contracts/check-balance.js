import { ethers } from "ethers";

const RPC_URL = "https://rpc.moderato.tempo.xyz";
const PRIVATE_KEY = "0xbdf9870ba6ab9fb6edc8eea5ba00390f7a1197209f696baf837c3f82518ede17";

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL, 42431);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  const balance = await provider.getBalance(wallet.address);
  console.log("Wallet Address:", wallet.address);
  console.log("Balance in eth/tempo:", ethers.formatEther(balance));
}

main().catch(console.error);
