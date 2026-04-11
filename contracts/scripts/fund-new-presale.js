import { ethers } from "ethers";
import fs from "fs";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://rpc.moderato.tempo.xyz");
  const wallet = new ethers.Wallet("0xbdf9870ba6ab9fb6edc8eea5ba00390f7a1197209f696baf837c3f82518ede17", provider);

  const tokenAddress = "0x9d3d8AE2Ac422D7eE1af8Bf3b7FCaE23d29fF5AA";
  const newPresaleAddress = fs.readFileSync("latest_deployment.txt", "utf8").trim();

  console.log("Funding NEW presale at:", newPresaleAddress);

  const tokenAbi = ["function transfer(address to, uint256 amount) public returns (bool)", "function balanceOf(address account) public view returns (uint256)"];
  const token = new ethers.Contract(tokenAddress, tokenAbi, wallet);

  const balance = await token.balanceOf(wallet.address);
  console.log("Wallet Balance:", ethers.formatUnits(balance, 18), "LEVI");

  const fundAmount = ethers.parseUnits("299000000", 18);
  
  console.log("Transferring 299M tokens...");
  const tx = await token.transfer(newPresaleAddress, fundAmount);
  await tx.wait();
  console.log("SUCCESS: NEW Presale funded with 299M LEVI!");
}

main().catch(console.error);
