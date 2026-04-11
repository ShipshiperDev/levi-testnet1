import { ethers } from "ethers";
import fs from "fs";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://rpc.moderato.tempo.xyz");
  const wallet = new ethers.Wallet("0xbdf9870ba6ab9fb6edc8eea5ba00390f7a1197209f696baf837c3f82518ede17", provider);

  console.log("Deploying with account:", wallet.address);

  const artifact = JSON.parse(fs.readFileSync("artifacts/contracts/LeviPresale.sol/LeviPresale.json", "utf8"));
  
  const tokenAddress = "0x9d3d8AE2Ac422D7eE1af8Bf3b7FCaE23d29fF5AA";
  const acceptedTokens = [
    "0x20c0000000000000000000000000000000000000",
    "0x20c0000000000000000000000000000000000001"
  ];
  const rate = 20000;

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  
  console.log("Deploying LeviPresale ($200 Limit)...");
  const contract = await factory.deploy(tokenAddress, acceptedTokens, rate);
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("-----------------------------------------");
  console.log("🚀 New Presale Deployed!");
  console.log(`NEW_PRESALE_ADDRESS="${address}"`);
  console.log("-----------------------------------------");
}

main().catch(console.error);
