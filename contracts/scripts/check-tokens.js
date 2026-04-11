import { ethers } from "ethers";
import fs from "fs";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://rpc.moderato.tempo.xyz");
  const presaleAddress = fs.readFileSync("latest_deployment.txt", "utf8").trim();
  
  const pathUSD = "0x20c0000000000000000000000000000000000000";
  const alphaUSD = "0x20c0000000000000000000000000000000000001";

  const abi = [
    "function acceptedTokens(address) view returns (bool)",
    "function presaleActive() view returns (bool)",
  ];
  const contract = new ethers.Contract(presaleAddress, abi, provider);

  const active = await contract.presaleActive();
  const pathOk = await contract.acceptedTokens(pathUSD);
  const alphaOk = await contract.acceptedTokens(alphaUSD);

  console.log("Presale:", presaleAddress);
  console.log("Presale Active:", active);
  console.log("pathUSD accepted:", pathOk);
  console.log("AlphaUSD accepted:", alphaOk);
}

main().catch(console.error);
