import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config({ path: "./contracts/.env" });

async function main() {
  const RPC_URL = "https://rpc.moderato.tempo.xyz";
  const CONTRACT_ADDRESS = "0xe4f23F93632F36e1849A81a69E52C7fe8eF2CeA9";
  const NEW_RATE = 2000; // 0.0005 USD per LEVI

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const abi = [
    "function setTokensPerUsdc(uint256 _tokensPerUsdc) external",
    "function tokensPerUsdc() view returns (uint256)"
  ];

  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

  console.log(`Current rate on-chain: ${await contract.tokensPerUsdc()}`);
  console.log(`Updating rate to: ${NEW_RATE}...`);

  const tx = await contract.setTokensPerUsdc(NEW_RATE);
  console.log(`Transaction sent: ${tx.hash}`);
  await tx.wait();
  
  console.log(`Rate successfully updated to: ${await contract.tokensPerUsdc()}`);
}

main().catch(console.error);
