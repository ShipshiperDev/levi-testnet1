import { ethers } from "ethers";
import fs from "fs";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://rpc.moderato.tempo.xyz");
  const pk = "0xbdf9870ba6ab9fb6edc8eea5ba00390f7a1197209f696baf837c3f82518ede17";
  const wallet = new ethers.Wallet(pk, provider);

  const balance = await provider.getBalance(wallet.address);
  console.log("Gas Balance:", ethers.formatUnits(balance, 18), "TEMPO");

  if (balance < ethers.parseEther("0.1")) {
     console.log("Error: Low gas balance. Please fund the deployer wallet.");
     return;
  }

  const artifact = JSON.parse(fs.readFileSync("artifacts/contracts/LeviPresale.sol/LeviPresale.json", "utf8"));
  
  const tokenAddress = "0x9d3d8AE2Ac422D7eE1af8Bf3b7FCaE23d29fF5AA";
  const acceptedTokens = [
    "0x20c0000000000000000000000000000000000000",
    "0x20c0000000000000000000000000000000000001"
  ];
  const rate = 20000;

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  
  console.log("Deploying LeviPresale ($200 Limit)...");
  const deployTx = await factory.getDeployTransaction(tokenAddress, acceptedTokens, rate);
  
  const tx = await wallet.sendTransaction(deployTx);
  console.log("Deployment Transaction Sent! Hash:", tx.hash);
  
  console.log("Waiting for confirmation...");
  const receipt = await tx.wait();
  console.log("Transaction Confirmed in block", receipt.blockNumber);
  console.log("Contract deployed to:", receipt.contractAddress);

  if (receipt.contractAddress) {
     console.log("SUCCESS!");
     fs.writeFileSync("latest_deployment.txt", receipt.contractAddress);
  }
}

main().catch(console.error);
