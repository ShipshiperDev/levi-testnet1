import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://rpc.moderato.tempo.xyz");
  const address = "0xe50B944063F282662EFbF8C8A68CEC83da47437A".toLowerCase();
  
  const abi = [
    "function presaleActive() view returns (bool)",
    "function owner() view returns (address)",
    "function totalSold() view returns (uint256)"
  ];
  const contract = new ethers.Contract(address, abi, provider);

  try {
    const active = await contract.presaleActive();
    const owner = await contract.owner();
    const sold = await contract.totalSold();
    console.log("Status for", address);
    console.log("Presale Active:", active);
    console.log("Owner:", owner);
    console.log("Total Sold:", ethers.formatUnits(sold, 18), "LEVI");
  } catch (e) {
    console.error("Error fetching status:", e.message);
    const code = await provider.getCode(address);
    console.log("Contract Code Length at address:", code.length);
  }
}

main().catch(console.error);
